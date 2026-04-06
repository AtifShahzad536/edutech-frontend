import React from 'react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ComposedChart,
} from 'recharts';
import { useState, useEffect } from 'react';

// Colors for charts
const COLORS = ['#4F46E5', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];

// Line Chart Component
interface LineChartProps {
  data: any[];
  xKey: string;
  yKey: string;
  color?: string;
  title?: string;
}

export const ChartLine: React.FC<LineChartProps> = ({ 
  data, 
  xKey, 
  yKey, 
  color = '#4F46E5',
  title 
}) => {
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);
  if (!mounted) return <div className="w-full h-64 bg-white/5 animate-pulse rounded-xl" />;

  return (
    <div className="w-full h-64 min-h-[256px] relative">
      {title && <h4 className="text-sm font-medium text-gray-700 mb-2">{title}</h4>}
      <div className="w-full h-56">
        <ResponsiveContainer width="100%" height="100%" minWidth={0}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
            <XAxis dataKey={xKey} stroke="#6B7280" fontSize={12} />
            <YAxis stroke="#6B7280" fontSize={12} />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'rgba(0, 0, 0, 0.8)', 
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '12px',
                backdropFilter: 'blur(8px)',
                color: '#fff'
              }} 
              itemStyle={{ color: '#fff' }}
            />
            <Line 
              type="monotone" 
              dataKey={yKey} 
              stroke={color} 
              strokeWidth={2}
              dot={{ fill: color, r: 4 }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

// Bar Chart Component
interface BarChartProps {
  data: any[];
  xKey: string;
  yKey: string;
  color?: string;
  title?: string;
}

export const ChartBar: React.FC<BarChartProps> = ({ 
  data, 
  xKey, 
  yKey, 
  color = '#4F46E5',
  title 
}) => {
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);
  if (!mounted) return <div className="w-full h-64 bg-white/5 animate-pulse rounded-xl" />;

  return (
    <div className="w-full h-64 min-h-[256px] relative">
      {title && <h4 className="text-sm font-medium text-gray-700 mb-2">{title}</h4>}
      <div className="w-full h-56">
        <ResponsiveContainer width="100%" height="100%" minWidth={0}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
            <XAxis dataKey={xKey} stroke="#6B7280" fontSize={12} />
            <YAxis stroke="#6B7280" fontSize={12} />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'rgba(0, 0, 0, 0.8)', 
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '12px',
                backdropFilter: 'blur(8px)',
                color: '#fff'
              }} 
              itemStyle={{ color: '#fff' }}
            />
            <Bar dataKey={yKey} fill={color} radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

// Pie Chart Component
interface PieChartProps {
  data: any[];
  nameKey: string;
  valueKey: string;
  title?: string;
}

export const ChartPie: React.FC<PieChartProps> = ({ 
  data, 
  nameKey, 
  valueKey,
  title 
}) => {
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);
  
  const renderCustomizedLabel = (props: any) => {
    const { cx, cy, midAngle, innerRadius, outerRadius, percent } = props;
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text 
        x={x} 
        y={y} 
        fill="white" 
        textAnchor={x > cx ? 'start' : 'end'} 
        dominantBaseline="central"
        fontSize={12}
        fontWeight="bold"
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  return (
    <div className="w-full h-64 min-h-[256px] relative">
      {title && <h4 className="text-sm font-medium text-gray-700 mb-2">{title}</h4>}
      <div className="w-full h-56">
        <ResponsiveContainer width="100%" height="100%" minWidth={0}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={renderCustomizedLabel}
              outerRadius={80}
              fill="#8884d8"
              dataKey={valueKey}
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'rgba(0, 0, 0, 0.8)', 
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '12px',
                backdropFilter: 'blur(8px)',
                color: '#fff'
              }} 
              itemStyle={{ color: '#fff' }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

// Area Chart Component
interface AreaChartProps {
  data: any[];
  xKey: string;
  yKey: string;
  color?: string;
  title?: string;
}

export const ChartArea: React.FC<AreaChartProps> = ({ 
  data, 
  xKey, 
  yKey, 
  color = '#4F46E5',
  title 
}) => {
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);
  if (!mounted) return <div className="w-full h-64 bg-white/5 animate-pulse rounded-xl" />;

  return (
    <div className="w-full h-64 min-h-[256px] relative">
      {title && <h4 className="text-sm font-medium text-gray-700 mb-2">{title}</h4>}
      <div className="w-full h-56">
        <ResponsiveContainer width="100%" height="100%" minWidth={0}>
          <AreaChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
            <XAxis dataKey={xKey} stroke="#6B7280" fontSize={12} />
            <YAxis stroke="#6B7280" fontSize={12} />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'rgba(0, 0, 0, 0.8)', 
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '12px',
                backdropFilter: 'blur(8px)',
                color: '#fff'
              }} 
              itemStyle={{ color: '#fff' }}
            />
            <Area 
              type="monotone" 
              dataKey={yKey} 
              stroke={color} 
              fill={color} 
              fillOpacity={0.3}
              strokeWidth={2}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

// Radar Chart Component
interface RadarChartProps {
  data: any[];
  xKey: string;
  yKey: string;
  color?: string;
  title?: string;
}

export const ChartRadar: React.FC<RadarChartProps> = ({
  data,
  xKey,
  yKey,
  color = '#6366f1',
  title
}) => {
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);
  if (!mounted) return <div className="w-full h-full min-h-[160px] bg-white/5 animate-pulse rounded-xl" />;

  return (
    <div className="w-full h-full min-h-[160px] relative">
      {title && <h4 className="text-[10px] font-bold text-gray-500 mb-2 uppercase tracking-widest">{title}</h4>}
      <div className="w-full h-full">
        <ResponsiveContainer width="100%" height="100%" minWidth={0}>
          <RadarChart cx="50%" cy="50%" outerRadius="70%" data={data}>
            <PolarGrid stroke="rgba(255, 255, 255, 0.05)" />
            <PolarAngleAxis dataKey={xKey} tick={{ fill: 'rgba(255, 255, 255, 0.4)', fontSize: 8 }} />
            <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
            <Radar
              name={yKey}
              dataKey={yKey}
              stroke={color}
              fill={color}
              fillOpacity={0.4}
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'rgba(0, 0, 0, 0.85)', 
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '8px',
                backdropFilter: 'blur(10px)',
                color: '#fff',
                fontSize: '10px'
              }} 
              itemStyle={{ color: '#fff' }}
            />
          </RadarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

// Stats Card with mini chart
interface StatChartCardProps {
  title: string;
  value: string | number;
  change?: string;
  changeType?: 'positive' | 'negative' | 'neutral';
  chart?: React.ReactNode;
}

export const StatChartCard: React.FC<StatChartCardProps> = ({ 
  title, 
  value, 
  change, 
  changeType = 'neutral',
  chart 
}) => {
  const changeColor = {
    positive: 'text-green-600',
    negative: 'text-red-600',
    neutral: 'text-gray-600'
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 text-gray-900">
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="text-sm text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          {change && (
            <p className={`text-sm ${changeColor[changeType]}`}>
              {changeType === 'positive' && '↑ '}
              {changeType === 'negative' && '↓ '}
              {change}
            </p>
          )}
        </div>
      </div>
      {chart && <div className="mt-4">{chart}</div>}
    </div>
  );
};

// Composed Chart Component (Line + Bar)
interface ComposedChartProps {
  data: any[];
  xKey: string;
  barKey: string;
  lineKey: string;
  title?: string;
}

export const ChartComposed: React.FC<ComposedChartProps> = ({
  data,
  xKey,
  barKey,
  lineKey,
  title
}) => {
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);
  if (!mounted) return <div className="w-full h-64 bg-white/5 animate-pulse rounded-xl" />;

  return (
    <div className="w-full h-64 min-h-[256px] relative">
      {title && <h4 className="text-sm font-medium text-gray-400 mb-2 uppercase tracking-widest">{title}</h4>}
      <div className="w-full h-56">
        <ResponsiveContainer width="100%" height="100%" minWidth={0}>
          <ComposedChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.05)" />
            <XAxis dataKey={xKey} stroke="#6B7280" fontSize={10} tickLine={false} axisLine={false} />
            <YAxis stroke="#6B7280" fontSize={10} tickLine={false} axisLine={false} />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'rgba(0, 0, 0, 0.8)', 
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '12px',
                backdropFilter: 'blur(8px)',
                color: '#fff'
              }} 
              itemStyle={{ color: '#fff' }}
            />
            <Bar dataKey={barKey} barSize={20} fill="#6366f1" radius={[4, 4, 0, 0]} fillOpacity={0.6} />
            <Line type="monotone" dataKey={lineKey} stroke="#06b6d4" strokeWidth={2} dot={{ r: 4 }} />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default { ChartLine, ChartBar, ChartPie, ChartArea, ChartRadar, ChartComposed, StatChartCard };
