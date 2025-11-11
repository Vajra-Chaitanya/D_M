import React, { useState, useRef, useEffect } from 'react';
import { 
  Box, 
  TextField, 
  Button, 
  Paper, 
  Typography, 
  CircularProgress,
  IconButton,
  Tooltip,
  Collapse
} from '@mui/material';
import { 
  Send as SendIcon, 
  Upload as UploadIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon
} from '@mui/icons-material';
import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';
import api from '../services/api';

interface Message {
  id: string;
  content: string;
  sender: 'user' | 'assistant';
  timestamp: Date;
  type?: 'text' | 'code' | 'image' | 'pdf';
  metadata?: Record<string, any>;
}

const ChatInterface: React.FC = () => {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({});
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async (e?: React.FormEvent) => {
    e?.preventDefault();
    
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: input,
      sender: 'user',
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await api.processQuery(input);
      
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: response.final_answer || 'I processed your request.',
        sender: 'assistant',
        timestamp: new Date(),
        metadata: {
          plan: response.plan,
          executionResults: response.execution_results,
          summary: response.summary,
        },
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Error processing message:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: 'Sorry, I encountered an error processing your request. Please try again.',
        sender: 'assistant',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsLoading(true);
    
    try {
      const response = await api.parsePdf(file);
      
      const message: Message = {
        id: Date.now().toString(),
        content: `I've processed the PDF: ${file.name}`,
        sender: 'assistant',
        timestamp: new Date(),
        type: 'pdf',
        metadata: {
          filename: file.name,
          content: response.content,
        },
      };

      setMessages(prev => [...prev, message]);
    } catch (error) {
      console.error('Error uploading file:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: 'Failed to process the PDF. Please try again.',
        sender: 'assistant',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const toggleSection = (sectionId: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [sectionId]: !prev[sectionId],
    }));
  };

  const renderMessageContent = (message: Message) => {
    if (message.type === 'code') {
      return (
        <pre style={{
          background: 'rgba(0, 0, 0, 0.2)',
          padding: '12px',
          borderRadius: '4px',
          overflowX: 'auto',
          margin: '8px 0',
          fontSize: '0.9em',
          lineHeight: 1.5,
        }}>
          <code>{message.content}</code>
        </pre>
      );
    }
    
    if (message.metadata?.content) {
      return (
        <Box>
          <Typography variant="body1" component="div">
            <ReactMarkdown rehypePlugins={[rehypeRaw]}>
              {message.content}
            </ReactMarkdown>
          </Typography>
          
          {message.metadata.plan && (
            <Box mt={2}>
              <Box 
                display="flex" 
                alignItems="center" 
                onClick={() => toggleSection(`${message.id}-plan`)}
                sx={{ cursor: 'pointer' }}
              >
                <Typography variant="subtitle2" color="textSecondary">
                  Plan
                </Typography>
                {expandedSections[`${message.id}-plan`] ? 
                  <ExpandLessIcon fontSize="small" /> : 
                  <ExpandMoreIcon fontSize="small" />
                }
              </Box>
              
              <Collapse in={expandedSections[`${message.id}-plan`]}>
                <Paper variant="outlined" sx={{ p: 2, mt: 1, bgcolor: 'background.paper' }}>
                  <pre style={{ margin: 0, whiteSpace: 'pre-wrap' }}>
                    {JSON.stringify(message.metadata.plan, null, 2)}
                  </pre>
                </Paper>
              </Collapse>
            </Box>
          )}
          
          {message.metadata.summary && (
            <Box mt={2}>
              <Box 
                display="flex" 
                alignItems="center" 
                onClick={() => toggleSection(`${message.id}-summary`)}
                sx={{ cursor: 'pointer' }}
              >
                <Typography variant="subtitle2" color="textSecondary">
                  Summary
                </Typography>
                {expandedSections[`${message.id}-summary`] ? 
                  <ExpandLessIcon fontSize="small" /> : 
                  <ExpandMoreIcon fontSize="small" />
                }
              </Box>
              
              <Collapse in={expandedSections[`${message.id}-summary`]}>
                <Paper variant="outlined" sx={{ p: 2, mt: 1, bgcolor: 'background.paper' }}>
                  <Typography variant="body2">
                    {message.metadata.summary}
                  </Typography>
                </Paper>
              </Collapse>
            </Box>
          )}
        </Box>
      );
    }

    return (
      <Typography variant="body1" component="div">
        <ReactMarkdown rehypePlugins={[rehypeRaw]}>
          {message.content}
        </ReactMarkdown>
      </Typography>
    );
  };

  return (
    <Box sx={{ 
      display: 'flex', 
      flexDirection: 'column',
      height: '100vh',
      maxWidth: '1200px',
      margin: '0 auto',
      p: 2,
      bgcolor: 'background.default',
    }}>
      {/* Header */}
      <Box sx={{ mb: 2, textAlign: 'center' }}>
        <Typography variant="h4" component="h1" gutterBottom>
          DualMind Assistant
        </Typography>
        <Typography variant="subtitle1" color="textSecondary">
          A domain-specific AI assistant
        </Typography>
      </Box>

      {/* Messages */}
      <Box 
        sx={{ 
          flexGrow: 1, 
          overflowY: 'auto', 
          mb: 2,
          p: 2,
          bgcolor: 'background.paper',
          borderRadius: 1,
          boxShadow: 1,
        }}
      >
        {messages.length === 0 ? (
          <Box 
            sx={{ 
              height: '100%', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              color: 'text.secondary',
            }}
          >
            <Typography>Send a message to start chatting with the assistant</Typography>
          </Box>
        ) : (
          messages.map((message) => (
            <Box 
              key={message.id} 
              sx={{ 
                mb: 2,
                display: 'flex',
                flexDirection: 'column',
                alignItems: message.sender === 'user' ? 'flex-end' : 'flex-start',
              }}
            >
              <Paper
                elevation={2}
                sx={{
                  p: 2,
                  maxWidth: '80%',
                  bgcolor: message.sender === 'user' ? 'primary.main' : 'background.paper',
                  color: message.sender === 'user' ? 'common.white' : 'text.primary',
                  borderRadius: 2,
                  borderTopLeftRadius: message.sender === 'assistant' ? 0 : 2,
                  borderTopRightRadius: message.sender === 'user' ? 0 : 2,
                  border: '1px solid',
                  borderColor: message.sender === 'user' ? 'primary.dark' : 'divider',
                }}
              >
                {renderMessageContent(message)}
                <Typography 
                  variant="caption" 
                  sx={{ 
                    display: 'block', 
                    mt: 1, 
                    textAlign: 'right',
                    color: message.sender === 'user' ? 'rgba(255, 255, 255, 0.7)' : 'text.secondary',
                  }}
                >
                  {message.timestamp.toLocaleTimeString()}
                </Typography>
              </Paper>
            </Box>
          ))
        )}
        <div ref={messagesEndRef} />
      </Box>

      {/* Input area */}
      <Box 
        component="form" 
        onSubmit={handleSendMessage}
        sx={{ 
          display: 'flex', 
          gap: 1,
          alignItems: 'center',
          p: 1,
          bgcolor: 'background.paper',
          borderRadius: 1,
          boxShadow: 3,
          border: '1px solid',
          borderColor: 'divider',
          '&:hover': {
            borderColor: 'primary.main',
          },
        }}
      >
        <input
          type="file"
          accept=".pdf"
          ref={fileInputRef}
          onChange={handleFileUpload}
          style={{ display: 'none' }}
        />
        
        <Tooltip title="Upload PDF">
          <IconButton 
            color="primary" 
            onClick={() => fileInputRef.current?.click()}
            disabled={isLoading}
          >
            <UploadIcon />
          </IconButton>
        </Tooltip>
        
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Type your message..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleSendMessage();
            }
          }}
          disabled={isLoading}
          multiline
          maxRows={4}
          sx={{ 
            '& .MuiOutlinedInput-root': {
              borderRadius: 4,
            },
          }}
        />
        
        <Button
          variant="contained"
          color="primary"
          onClick={handleSendMessage}
          disabled={isLoading || !input.trim()}
          sx={{ 
            minWidth: '48px',
            height: '48px',
            borderRadius: '50%',
          }}
        >
          {isLoading ? (
            <CircularProgress size={24} color="inherit" />
          ) : (
            <SendIcon />
          )}
        </Button>
      </Box>
    </Box>
  );
};

export default ChatInterface;
