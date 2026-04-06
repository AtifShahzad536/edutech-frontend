import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  FiCpu, FiTrendingUp, FiTarget, FiZap, FiClock, FiBookOpen,
  FiAward, FiBarChart2, FiRefreshCw, FiThumbsUp, FiThumbsDown,
  FiArrowRight, FiCheckCircle, FiAlertCircle, FiSun, FiTerminal,
  FiMessageSquare, FiSend, FiActivity, FiLayers, FiShield
} from 'react-icons/fi';
import Button from '@/components/ui/Button';
import { useRouter } from 'next/router';
import { useAppSelector } from '@/hooks/useRedux';
import { useAuthSync } from '@/hooks/useAuthSync';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { AuthenticatedPage } from '@/types';
import axios from 'axios';

const RecommendedCoursesPage: AuthenticatedPage = () => {
  const router = useRouter();
  const { user, token, isInitialized } = useAppSelector((state) => state.auth);
  useAuthSync();
  
  const [chatMessage, setChatMessage] = useState('');
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isChatLoading, setIsChatLoading] = useState(false);
  const [chatHistory, setChatHistory] = useState([
    { role: 'assistant', content: 'Analyzing your cognitive profile... Please wait.' }
  ]);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory, isChatLoading]);

  useEffect(() => {
    const fetchRecommendations = async () => {
      if (!token) return;
      try {
        const response = await axios.get('http://localhost:5000/api/recommendations', {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (response.data.success) {
          setRecommendations(response.data.recommendations);
          setChatHistory([
            { role: 'assistant', content: response.data.aiMessage }
          ]);
        }
      } catch (error) {
        console.error(error);
        setChatHistory([
          { role: 'assistant', content: "Hello! I couldn't fully analyze your recent profile due to a network disruption, but I am online and ready to answer any questions about courses." }
        ]);
      } finally {
        setIsLoading(false);
      }
    };
    
    if (isInitialized && token) {
      fetchRecommendations();
    }
  }, [token, isInitialized]);

  const studentDataPoints = useMemo(() => [
    { label: 'Learning Load', value: '48%', trend: '+12%', color: 'text-indigo-400' },
    { label: 'Study Speed', value: '2.4x', trend: '+0.5', color: 'text-purple-400' },
    { label: 'Retention', value: '94%', trend: '+2%', color: 'text-emerald-400' },
  ], []);

  const colorSchemes = [
    'from-indigo-600 to-purple-600',
    'from-purple-600 to-pink-600',
    'from-emerald-600 to-cyan-600',
    'from-blue-600 to-indigo-600'
  ];

  const handleSendMessage = async () => {
    if (!chatMessage.trim() || !token) return;
    const userMsg = { role: 'user', content: chatMessage };
    setChatHistory(prev => [...prev, userMsg]);
    setChatMessage('');
    setIsChatLoading(true);
    
    try {
      const response = await axios.post('http://localhost:5000/api/recommendations/ai-chat', {
        message: userMsg.content
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.data.success) {
        setChatHistory(prev => [...prev, {
          role: 'assistant',
          content: response.data.reply
        }]);
      }
    } catch (error) {
      console.error(error);
      setChatHistory(prev => [...prev, {
        role: 'assistant',
        content: "My cognitive link dropped! Try asking again in a moment."
      }]);
    } finally {
      setIsChatLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="pb-20 space-y-12">
        {/* Header */}
        <div className="relative overflow-hidden bg-gray-950 rounded-2xl p-10 md:p-14 text-white border border-white/5 shadow-2xl group">
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-600/10 rounded-full blur-[100px] -mr-24 -mt-24" />
          
          <div className="relative z-10 flex flex-col xl:flex-row items-center justify-between gap-10">
            <div className="space-y-6 text-center xl:text-left flex-1">
              <div className="inline-flex items-center space-x-3 bg-white/5 backdrop-blur-3xl border border-white/10 px-6 py-2 rounded-full">
                <FiCpu className="h-4 w-4 text-indigo-400" />
                <span className="text-[9px] font-bold tracking-widest uppercase text-gray-400">Personalized Learning</span>
              </div>
              <h1 className="text-5xl md:text-7xl font-bold uppercase tracking-tight leading-none text-white">
                Course <span className="text-indigo-500">Suggestions</span>
              </h1>
              <p className="text-lg text-gray-400 font-medium max-w-2xl leading-relaxed mx-auto xl:mx-0">
                We've analyzed your learning profile to find the best courses for your career path.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full xl:w-auto">
              {studentDataPoints.map((dp, i) => (
                <div key={i} className="bg-white/5 backdrop-blur-3xl border border-white/5 rounded-2xl p-6 text-center hover:bg-white/10 transition-all min-w-[140px]">
                  <div className={`text-2xl font-bold tracking-tight ${dp.color}`}>{dp.value}</div>
                  <div className="text-[8px] font-bold text-gray-500 uppercase tracking-widest mt-1 mb-1">{dp.label}</div>
                  <div className="text-[9px] font-bold text-emerald-400">{dp.trend}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Suggested Courses */}
          <div className="lg:col-span-2 space-y-8">
            <div className="flex items-center justify-between px-2">
              <h2 className="text-2xl font-bold text-white uppercase tracking-tight">
                Recommended <span className="text-indigo-500">Courses</span>
              </h2>
              <div className="flex items-center space-x-2">
                 <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-ping" />
                 <span className="text-[9px] font-bold text-indigo-400 uppercase tracking-widest">LIVE RESULTS</span>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {isLoading ? (
                 <div className="md:col-span-2 text-center py-20 text-indigo-400 font-bold tracking-widest uppercase animate-pulse">Running Cognitive Profile Analysis...</div>
              ) : recommendations.length === 0 ? (
                 <div className="md:col-span-2 bg-white/5 border border-white/10 rounded-2xl p-10 text-center">
                    <FiLayers className="h-10 w-10 text-gray-500 mx-auto mb-4" />
                    <h3 className="text-white font-bold tracking-tight">System Analyzing</h3>
                    <p className="text-xs text-gray-400 mt-2">Enroll in a few more courses so our AI Engine can detect your exact learning patterns and map custom trajectories.</p>
                 </div>
              ) : recommendations.map((rec: any, index: number) => {
                const scheme = colorSchemes[index % colorSchemes.length];
                return (
                  <div key={rec.id} className="group relative bg-gray-900/50 backdrop-blur-3xl rounded-2xl p-8 border border-white/5 shadow-2xl hover:shadow-indigo-500/10 transition-all hover:-translate-y-2 overflow-hidden flex flex-col">
                    <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${scheme} opacity-10 rounded-full blur-[60px] group-hover:scale-150 transition-transform duration-1000`} />
                    
                    <div className="space-y-6 relative z-10 flex-1 flex flex-col">
                      <div className="flex items-center justify-between">
                        <div className={`p-4 rounded-xl bg-gradient-to-br ${scheme} text-white shadow-xl`}>
                          <FiZap className="h-6 w-6" />
                        </div>
                        <div className="text-right">
                          <div className="text-[8px] font-bold text-gray-500 uppercase tracking-widest mb-1">MATCH RATING</div>
                          <div className="text-2xl font-bold text-white tracking-tight">{rec.matchScore}%</div>
                        </div>
                      </div>
                      
                      <div>
                        <h3 className="text-xl font-bold text-white uppercase tracking-tight leading-snug group-hover:text-indigo-400 transition-colors line-clamp-2">
                          {rec.title}
                        </h3>
                        <div className="flex items-center space-x-2 mt-2">
                           <div className="w-1 h-1 rounded-full bg-indigo-500" />
                           <p className="text-[8px] font-bold text-gray-500 uppercase tracking-widest">Instructor: {rec.instructor}</p>
                        </div>
                      </div>

                      <div className="bg-black/60 border border-white/5 p-5 rounded-2xl text-[10px] text-gray-400 leading-relaxed font-medium line-clamp-3">
                        "{rec.description}"
                      </div>

                      <button onClick={() => router.push(`/student/courses/${rec.id}`)} className="w-full mt-auto bg-white hover:bg-indigo-50 text-black py-4 rounded-xl font-bold uppercase tracking-widest text-[10px] transition-all shadow-xl active:scale-95 border-0">
                        View Course
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Chat Assistant */}
          <div className="bg-gray-900/60 backdrop-blur-3xl border border-white/5 rounded-2xl flex flex-col h-[650px] overflow-hidden shadow-2xl sticky top-32">
            <div className="p-8 border-b border-white/5 bg-black/20">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-indigo-500/10 rounded-xl flex items-center justify-center border border-indigo-500/20 shadow-inner">
                  <FiTerminal className="h-6 w-6 text-indigo-400" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white uppercase tracking-tight leading-none">Learning Assistant</h3>
                  <span className="text-[9px] font-bold text-indigo-400/60 uppercase tracking-widest mt-1 block">ONLINE</span>
                </div>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-8 space-y-6 custom-scrollbar">
              {chatHistory.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[90%] p-5 rounded-2xl text-[12px] font-medium leading-relaxed shadow-lg ${
                    msg.role === 'user' 
                      ? 'bg-indigo-600 text-white rounded-tr-none' 
                      : 'bg-white/5 border border-white/10 text-gray-300 rounded-tl-none backdrop-blur-xl'
                  }`}>
                    {msg.content}
                  </div>
                </div>
              ))}
              {isChatLoading && (
                <div className="flex justify-start">
                  <div className="bg-white/5 border border-white/10 p-5 rounded-2xl rounded-tl-none flex items-center space-x-2">
                    <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce" />
                    <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                    <div className="w-2 h-2 bg-indigo-300 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                  </div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            <div className="p-8 border-t border-white/5 bg-black/20">
              <div className="relative group">
                <input
                  type="text"
                  value={chatMessage}
                  onChange={(e) => setChatMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  placeholder="Ask a question..."
                  className="w-full bg-white/5 border border-white/10 py-5 px-6 pr-16 rounded-xl text-xs font-medium text-white focus:outline-none focus:border-indigo-500/40 focus:bg-white/10 transition-all"
                />
                <button 
                  onClick={handleSendMessage}
                  className="absolute right-2 top-1/2 -translate-y-1/2 w-12 h-12 bg-indigo-600 text-white rounded-lg hover:bg-indigo-500 transition-all flex items-center justify-center active:scale-95"
                >
                  <FiSend className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

RecommendedCoursesPage.allowedRoles = ['student', 'instructor', 'admin'];
export default RecommendedCoursesPage;
