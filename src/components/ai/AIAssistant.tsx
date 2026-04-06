import React, { useState, useRef, useEffect } from 'react';
import { FiSend, FiX, FiBookOpen, FiTarget, FiAward, FiTrendingUp, FiClock, FiMessageCircle, FiUpload, FiUser, FiLinkedin } from 'react-icons/fi';
import Button from '@/components/ui/Button';

interface Message {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  quickActions?: QuickAction[];
}

interface QuickAction {
  label: string;
  action: () => void;
  icon?: React.ComponentType<any>;
}

interface AIAssistantProps {
  isOpen: boolean;
  onClose: () => void;
  userName?: string;
  userProgress?: {
    coursesCompleted: number;
    currentStreak: number;
    totalHours: number;
    currentCourse?: string;
    courseProgress?: number;
  };
  userProfile?: {
    firstName?: string;
    lastName?: string;
    email?: string;
    phone?: string;
    bio?: string;
    linkedinUrl?: string;
    skills?: string[];
  };
}

const AIAssistant: React.FC<AIAssistantProps> = ({ 
  isOpen, 
  onClose, 
  userName = 'Student',
  userProgress = {
    coursesCompleted: 3,
    currentStreak: 7,
    totalHours: 48,
    currentCourse: 'Introduction to React',
    courseProgress: 75
  },
  userProfile = {
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@example.com',
    phone: '+1 (555) 123-4567',
    bio: 'Passionate learner focused on React and TypeScript development',
    linkedinUrl: 'https://linkedin.com/in/johndoe',
    skills: ['React', 'TypeScript', 'JavaScript', 'Node.js', 'CSS', 'HTML']
  }
}) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      setTimeout(() => {
        const greetingMessage: Message = {
          id: '1',
          type: 'assistant',
          content: `## 👋 Welcome back, ${userName}!\n\nI'm your AI Learning Assistant, here to help you achieve your learning goals faster.\n\n### 🎯 What I can help you with:\n\n- 📊 **Track your progress** and learning insights\n- 📚 **Personalized course recommendations** based on your goals\n- 🎯 **Smart goal setting** to keep you motivated\n- 💡 **Study tips** and learning strategies\n- ❓ **Answer questions** about your courses\n- 👤 **Profile management** - Update your information and connect LinkedIn\n\n### 🚀 Quick Start:\n\nTry asking me:\n- *"How am I doing with my learning?"*\n- *"What courses should I take next?"*\n- *"Help me set learning goals for this week"*`,
          timestamp: new Date(),
          quickActions: [
            {
              label: 'Show my progress',
              action: () => handleProgressCheck(),
              icon: FiTrendingUp
            },
            {
              label: 'Course recommendations',
              action: () => handleCourseRecommendations(),
              icon: FiBookOpen
            },
            {
              label: 'Set learning goals',
              action: () => handleLearningGoals(),
              icon: FiTarget
            },
            {
              label: 'Update my profile',
              action: () => {},
              icon: FiUser
            }
          ]
        };
        setMessages([greetingMessage]);
      }, 500);
    }
  }, [isOpen, userName, messages.length]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleProgressCheck = () => {
    setIsTyping(true);
    setTimeout(() => {
      const progressContent = `## 📊 Your Progress Analysis

### 🎯 Current Performance

| Metric | Value | Status |
|--------|--------|--------|
| **Learning Streak** | ${userProgress?.currentStreak || 0} days | 🔥 Active |
| **Courses Completed** | ${userProgress?.coursesCompleted || 0} | ✅ On Track |
| **Total Hours** | ${userProgress?.totalHours || 0}h | 📈 Above Average |
| **Current Course** | ${userProgress?.currentCourse || 'Not enrolled'} | 📚 ${userProgress?.courseProgress || 0}% Complete |

### 💡 Key Insights

- **🔥 Strong Momentum**: Your ${userProgress?.currentStreak || 0}-day streak shows excellent consistency!
- **📈 Performance**: Learning speed is **25% above average** - impressive!
- **🎯 Focus**: You are ${userProgress?.courseProgress || 0}% through React course - keep going!
- **⭐ Achievement**: You are in the **top 15%** of learners this week!

### 🚀 Recommended Next Steps

1. **Complete React course** - Only ${100 - (userProgress?.courseProgress || 0)}% remaining!
2. **Start TypeScript** - Perfect next step after React
3. **Practice projects** - Apply your React skills
4. **Join community** - Connect with other learners

---

*💬 Want detailed analytics or specific learning recommendations?*`;

      const progressMessage: Message = {
        id: Date.now().toString(),
        type: 'assistant',
        content: progressContent,
        timestamp: new Date(),
        quickActions: [
          {
            label: 'View detailed analytics',
            action: () => {},
            icon: FiTrendingUp
          },
          {
            label: 'Get learning tips',
            action: () => {},
            icon: FiTarget
          }
        ]
      };
      setMessages(prev => [...prev, progressMessage]);
      setIsTyping(false);
    }, 1000);
  };

  const handleCourseRecommendations = () => {
    setIsTyping(true);
    setTimeout(() => {
      const courseContent = `## 🎯 Personalized Course Recommendations

### 📚 Based on Your Progress in ${userProgress.currentCourse}

#### 🔥 Top Priority Courses

| Course | Level | Duration | Why Perfect for You |
|--------|--------|----------|--------------------|
| **Advanced React Patterns** | Intermediate | 6 weeks | Builds directly on your current React knowledge |
| **TypeScript Deep Dive** | Intermediate | 4 weeks | Essential for professional React development |
| **React Testing with Jest** | Intermediate | 3 weeks | Critical skill for production apps |
| **State Management with Redux** | Advanced | 5 weeks | Next step in React mastery |

### 💡 Why These Courses?

#### 🎯 Skill Alignment
- **React Progress**: You're ${userProgress.courseProgress}% through React - perfect timing for advanced topics!
- **Career Growth**: These are the most in-demand React ecosystem skills
- **Learning Path**: Logical progression from basics to advanced concepts

#### 📈 Market Demand
- **TypeScript**: 85% of React jobs require TypeScript skills
- **Testing**: 92% of companies prioritize test coverage
- **State Management**: Essential for large-scale applications

### 🚀 Recommended Learning Path

Current: React Basics (${userProgress.courseProgress}% complete)
    ↓
1. Advanced React Patterns (2 weeks)
    ↓  
2. TypeScript Deep Dive (3 weeks)
    ↓
3. React Testing (2 weeks)
    ↓
4. Redux & State Management (3 weeks)

### ⚡ Quick Actions

- 🎯 **Start with Advanced React** - Most natural next step
- 📚 **Bundle & Save** - Get all 4 courses for 20% off
- ⏰ **Flexible Schedule** - Learn at your own pace

---

*💬 Want me to enroll you in any of these courses or need more details about the curriculum?*`;

      const courseMessage: Message = {
        id: Date.now().toString(),
        type: 'assistant',
        content: courseContent,
        timestamp: new Date(),
        quickActions: [
          {
            label: 'Enroll in React Patterns',
            action: () => {},
            icon: FiBookOpen
          },
          {
            label: 'View curriculum details',
            action: () => {},
            icon: FiBookOpen
          },
          {
            label: 'Get bundle pricing',
            action: () => {},
            icon: FiTarget
          }
        ]
      };
      setMessages(prev => [...prev, courseMessage]);
      setIsTyping(false);
    }, 1200);
  };

  const handleLearningGoals = () => {
    setIsTyping(true);
    setTimeout(() => {
      const goalsMessage: Message = {
        id: Date.now().toString(),
        type: 'assistant',
        content: `## 🎯 Smart Learning Goals\n\n### 📅 Based on Your Learning Patterns\n\n#### 🏆 This Week's Goals\n\n| Goal | Target | Status | Why This Matters |\n|------|--------|--------|-----------------|\n| **Complete React lessons** | 2 more lessons | 📝 In Progress | Finish React course faster |\n| **Daily study time** | 1 hour/day | ⏰ On Track | Build consistent habit |\n| **Practice quiz** | 1 quiz | 🎯 Ready | Test your knowledge |\n| **Review notes** | 15 min/day | 📚 Good | Retain information better |\n\n#### 🎯 This Month's Goals\n\n### 📈 Primary Objectives\n\n1. **🎓 Complete React Course**\n   - Progress: ${userProgress.courseProgress}% complete\n   - Remaining: ${100 - (userProgress.courseProgress || 0)}%\n   - Timeline: 2-3 weeks\n   - Success metric: Course completion certificate\n\n2. **📚 Start TypeScript Fundamentals**\n   - Prerequisite: React completion\n   - Duration: 4 weeks\n   - Goal: Basic TypeScript proficiency\n\n3. **🏆 Earn Achievement Badge**\n   - Target: "Week Warrior" badge\n   - Current: ${userProgress.currentStreak} day streak\n   - Need: Maintain streak for 7 more days\n\n### 💡 Personalized Recommendations\n\n#### 🧠 Study Strategy\n- **Best learning time**: 2-4 PM (your peak focus hours)\n- **Optimal session length**: 45-60 minutes\n- **Break frequency**: Every 25 minutes (Pomodoro technique)\n- **Review schedule**: Every 3 days for retention\n\n#### 🎯 Success Factors\n- **Consistency over intensity**: Daily practice > cramming\n- **Active learning**: Code along with videos, take notes\n- **Community engagement**: Join study groups, ask questions\n- **Real projects**: Apply skills to mini-projects\n\n### ⚡ Quick Actions\n\n- 🎯 **Set weekly goals** - Commit to specific targets\n- 📅 **Schedule study time** - Block calendar time\n- 🏆 **Track achievements** - Monitor progress\n- 👥 **Find study partner** - Learn together\n\n---\n\n*💬 Ready to commit to these goals or want me to adjust them based on your schedule?*`,
        timestamp: new Date(),
        quickActions: [
          {
            label: 'Set weekly goals',
            action: () => {},
            icon: FiTarget
          },
          {
            label: 'Set monthly goals',
            action: () => {},
            icon: FiTarget
          },
          {
            label: 'Get study schedule',
            action: () => {},
            icon: FiClock
          }
        ]
      };
      setMessages(prev => [...prev, goalsMessage]);
      setIsTyping(false);
    }, 1000);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleSendMessage = () => {
    if (inputValue.trim() === '') return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: inputValue,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);

    // Simulate AI response
    setTimeout(() => {
      const response = generateAIResponse(inputValue);
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: response,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, assistantMessage]);
      setIsTyping(false);
    }, 1500);
  };
  const generateAIResponse = (userInput: string): string => {
  const lowerInput = userInput.toLowerCase();
  
  if (lowerInput.includes('progress') || lowerInput.includes('how am i doing')) {
    const progress = userProgress?.courseProgress || 0;
    return `## 📊 Your Progress Analysis\n\n### 🎯 Current Performance\n\n| Metric | Value | Status |\n|--------|--------|--------|\n| **Learning Streak** | ${userProgress?.currentStreak} days | 🔥 Active |\n| **Courses Completed** | ${userProgress?.coursesCompleted} | ✅ On Track |\n| **Total Hours** | ${userProgress?.totalHours}h | 📈 Above Average |\n| **Current Course** | ${userProgress?.currentCourse} | 📚 ${progress}% Complete |\n\n### 💡 Key Insights\n\n- **🔥 Strong Momentum**: Your ${userProgress?.currentStreak}-day streak shows excellent consistency!\n- **📈 Performance**: Learning speed is **25% above average** - impressive!\n- **🎯 Focus**: You're ${progress}% through React course - keep going!\n- **⭐ Achievement**: You're in the **top 15%** of learners this week!\n\n### 🚀 Recommended Next Steps\n\n1. **Complete React course** - Only ${100 - progress}% remaining!\n2. **Start TypeScript** - Perfect next step after React\n3. **Practice projects** - Apply your React skills\n4. **Join community** - Connect with other learners\n\n---\n\n*💬 Want detailed analytics or specific learning recommendations?*`;
  }
  
  if (lowerInput.includes('course') || lowerInput.includes('learn')) {
    return `## 📚 Course Guidance\n\n### 🎯 **Current Focus**\nYou're doing great with **${userProgress?.currentCourse}** (${userProgress?.courseProgress}% complete)!\n\n### 🚀 Recommended Next Steps**\n\n1. **Advanced React Patterns** - Perfect continuation\n2. **TypeScript Deep Dive** - Strengthen your foundation\n3. **React Testing with Jest** - Essential skill\n4. **State Management with Redux** - Advanced concepts\n\n### 💡 **Learning Tips**\n\n- Focus on understanding concepts, not just completing lessons\n- Practice with small projects after each module\n- Join community for discussions and help\n\n---\n\n*💬 Want detailed course recommendations or enrollment help?*`;
  }
  
  if (lowerInput.includes('help') || lowerInput.includes('stuck')) {
    return `## 🤝 I'm Here to Help!\n\n### 💡 **How I Can Assist**\n\n#### 📚 **Course Support**\n- Explain difficult concepts\n- Provide additional resources\n- Suggest practice exercises\n- Answer specific questions\n\n#### 🎯 **Learning Strategy**\n- Optimize your study schedule\n- Improve retention techniques\n- Set achievable goals\n- Track progress effectively\n\n#### 🚀 **Career Guidance**\n- Skill development paths\n- Industry trends\n- Portfolio suggestions\n- Interview preparation\n\n#### 👤 **Profile Enhancement**\n- Resume optimization\n- LinkedIn profile improvement\n- Skills assessment\n- Document management\n- Job search assistance\n\n### ❓ **What specific challenge are you facing?**\n\nTell me more about:\n- Which course or topic?\n- What's confusing you?\n- Your learning goals?\n- Time constraints?\n\n---\n\n*💬 The more details you share, the better I can help you!*`;
  }
  
  if (lowerInput.includes('profile') || lowerInput.includes('update profile')) {
    const profile = userProfile || {};
    const completion = Object.values(profile || {}).filter(Boolean).length;
    const completeness = Math.round((completion / 6) * 100);
    
    return `## 👤 Profile Management\n\n### 📝 **Current Profile Status**\n\n| Field | Status | Action Needed |\n|-------|--------|-------------|\n| **Name** | ${profile.firstName || 'Not set'} ${profile.lastName || ''} | ✅ Complete |\n| **Email** | ${profile.email || 'Not set'} | ✅ Verified |\n| **LinkedIn** | ${profile.linkedinUrl ? '✅ Connected' : '❌ Not connected'} | ${profile.linkedinUrl ? 'Update URL' : 'Add URL'} |\n| **Skills** | ${profile.skills?.length || 0} listed | ✅ Up to date |\n| **Bio** | ${profile.bio ? '✅ Added' : '❌ Missing'} | ${profile.bio ? 'Edit' : 'Add'} |\n\n### 🎯 **Profile Completeness**\n\nYour profile is **${completeness}%** complete!\n\n### 💡 **Profile Optimization Tips**\n\n#### 🔍 **LinkedIn Integration**\n- **Professional URL**: ${profile.linkedinUrl || 'Add your LinkedIn profile'}\n- **Networking**: Connect with instructors and peers\n- **Career opportunities**: Increase visibility to recruiters\n\n#### 📄 **Document Upload**\n- **Resume**: Upload your latest resume\n- **Certificates**: Add course completion certificates\n- **Portfolio**: Showcase your best projects\n\n#### 🎯 **Skills Enhancement**\n- **Current skills**: ${profile.skills?.join(', ') || 'Add your technical skills'}\n- **Skill gaps**: Identify areas for improvement\n- **Industry keywords**: Add relevant technical terms\n\n### ⚡ **Quick Actions**\n\n- 📄 **Update Profile Information**\n- 📄 **Upload Documents**\n- 🔗 **Connect LinkedIn**\n- 🎯 **Add Skills**\n\n---\n\n*💬 Ready to help you optimize your profile for better job opportunities?*`;
  }
  
  if (lowerInput.includes('help') || lowerInput.includes('stuck')) {
    return `## 🤝 I'm Here to Help!\n\n### 💡 **How I Can Assist**\n\n#### 📚 **Course Support**\n- Explain difficult concepts\n- Provide additional resources\n- Suggest practice exercises\n- Answer specific questions\n\n#### 🎯 **Learning Strategy**\n- Optimize your study schedule\n- Improve retention techniques\n- Set achievable goals\n- Track progress effectively\n\n#### 🚀 **Career Guidance**\n- Skill development paths\n- Industry trends\n- Portfolio suggestions\n- Interview preparation\n\n#### 👤 **Profile Enhancement**\n- Resume optimization\n- LinkedIn profile improvement\n- Skills assessment\n- Document management\n- Job search assistance\n\n#### 📄 **Document Upload**\n- Resume/CV upload\n- Certificate management\n- Portfolio document organization\n- Cover letter assistance\n\n### ❓ **What specific challenge are you facing?**\n\nTell me more about:\n- Which course or topic?\n- What's confusing you?\n- Your learning goals?\n- Time constraints?\n- Profile completion needs?\n- Career planning questions?\n\n---\n\n*💬 The more details you share, the better I can help you!*`;
  }
  
  return `## 💬 Let Me Help You!\n\nI understand you're asking about: **"${userInput}"**\n\n### 🤖 **What I Can Do**\n\n#### 📊 **Progress & Analytics**\n- Track your learning performance\n- Provide detailed insights\n- Compare with average learners\n- Suggest improvements\n\n#### 📚 **Course Guidance**\n- Personalized recommendations\n- Learning path optimization\n- Skill gap analysis\n- Career alignment\n\n#### 🎯 **Goal Setting**\n- SMART goal creation\n- Progress tracking\n- Motivation strategies\n- Schedule optimization\n\n#### 👤 **Profile Management**\n- Update profile information\n- Upload documents (resume, certificates)\n- LinkedIn integration\n- Skills assessment\n- Resume optimization\n\n#### 💡 **Learning Support**\n- Concept explanations\n- Study tips\n- Resource recommendations\n- Problem-solving help\n\n### ❓ **Try Asking Me**\n\n- *"How am I progressing with React?"*\n- *"What should I learn next?"*\n- *"Help me set goals for this week"* \n- *"I'm stuck on TypeScript concepts"* \n- *"Update my profile"* \n- *"Upload my resume"* \n- *"Connect my LinkedIn"* \n- *"Help me optimize my profile for jobs"* \n\n---\n\n*💬 What specific area would you like help with?*`;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[85vh] flex flex-col mx-4">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg">
              <span className="text-white font-bold">AI</span>
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">AI Learning Assistant</h2>
              <p className="text-sm text-gray-600">Your personal learning guide</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="rounded-full p-2 hover:bg-gray-100"
          >
            <FiX className="h-5 w-5" />
          </Button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gray-50">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[85%] rounded-2xl px-5 py-4 ${
                  message.type === 'user'
                    ? 'bg-primary-600 text-white'
                    : 'bg-white text-gray-900 shadow-sm border border-gray-200'
                }`}
              >
                <div className="prose prose-sm max-w-none">
                  {message.content.split('\n').map((line, index) => {
                    if (line.startsWith('## ')) {
                      return <h3 key={index} className="text-lg font-bold mt-3 mb-2">{line.replace('## ', '')}</h3>;
                    }
                    if (line.startsWith('### ')) {
                      return <h4 key={index} className="text-base font-semibold mt-2 mb-1">{line.replace('### ', '')}</h4>;
                    }
                    if (line.startsWith('#### ')) {
                      return <h5 key={index} className="text-sm font-semibold mt-2 mb-1">{line.replace('#### ', '')}</h5>;
                    }
                    if (line.startsWith('- **')) {
                      return <li key={index} className="ml-4 my-1">{line.replace('- ', '')}</li>;
                    }
                    if (line.startsWith('1. **') || line.startsWith('2. **') || line.startsWith('3. **') || line.startsWith('4. **')) {
                      return <li key={index} className="ml-4 my-1 list-decimal">{line.replace(/^\d+\. /, '')}</li>;
                    }
                    if (line.startsWith('|')) {
                      return <div key={index} className="text-xs my-2 overflow-x-auto"><table className="w-full"><tbody>{line.split('|').filter(cell => cell.trim()).map((cell, cellIndex) => <td key={cellIndex} className="px-2 py-1 border border-gray-200">{cell.trim()}</td>)}</tbody></table></div>;
                    }
                    if (line.startsWith('```')) {
                      return <pre key={index} className="bg-gray-100 p-2 rounded text-xs my-2">{line.replace('```', '')}</pre>;
                    }
                    if (line.startsWith('*')) {
                      return <p key={index} className="text-xs italic mt-2 text-gray-500">{line}</p>;
                    }
                    if (line.trim() === '') {
                      return <br key={index} />;
                    }
                    return <p key={index} className="my-1">{line}</p>;
                  })}
                </div>
                
                {/* Quick Actions */}
                {message.quickActions && message.type === 'assistant' && (
                  <div className="mt-4 space-y-2 border-t pt-3">
                    {message.quickActions.map((action, index) => {
                      const Icon = action.icon;
                      return (
                        <button
                          key={index}
                          onClick={action.action}
                          className="flex items-center space-x-2 w-full text-left bg-gray-50 hover:bg-gray-100 rounded-lg px-3 py-2 text-sm text-gray-700 transition-colors border border-gray-200"
                        >
                          {Icon && <Icon className="h-4 w-4 text-blue-500" />}
                          <span>{action.label}</span>
                        </button>
                      );
                    })}
                  </div>
                )}
                
                <div className="text-xs text-gray-400 mt-3 pt-2 border-t">
                  {message.timestamp.toLocaleTimeString()}
                </div>
              </div>
            </div>
          ))}
          
          {isTyping && (
            <div className="flex justify-start">
              <div className="bg-white rounded-2xl px-5 py-4 shadow-sm border border-gray-200">
                <div className="flex items-center space-x-2">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                  <span className="text-sm text-gray-600">AI is thinking...</span>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="p-4 border-t border-gray-200 bg-white">
          <div className="flex items-center space-x-3">
            <div className="flex-1 relative">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask me anything about your learning journey..."
                className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
                disabled={isTyping}
              />
              <Button
                variant="ghost"
                size="sm"
                onClick={handleSendMessage}
                disabled={isTyping || inputValue.trim() === ''}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 rounded-full p-2"
              >
                <FiSend className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {}}
                className="rounded-full p-2"
              >
                <FiMessageCircle className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {}}
                className="rounded-full p-2"
              >
                <FiUser className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {}}
                className="rounded-full p-2"
              >
                <FiLinkedin className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIAssistant;
