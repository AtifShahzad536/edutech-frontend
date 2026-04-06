import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface Assignment {
  id: string;
  title: string;
  course: string;
  description: string;
  dueDate: string;
  submissions: number;
  totalStudents: number;
  status: 'Active' | 'Reviewing' | 'Completed' | 'pending' | 'submitted' | 'graded';
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  instructor?: string;
  score?: number;
  maxScore: number;
  feedback?: string;
  submittedAt?: string;
}

interface AssignmentState {
  assignments: Assignment[];
}

const initialState: AssignmentState = {
  assignments: [
    { 
      id: '1', 
      title: 'React Architecture Patterns', 
      course: 'React Development Mastery', 
      description: 'Implement a modular architecture using React context and specialized hooks.',
      dueDate: '2024-03-25', 
      submissions: 45, 
      totalStudents: 150,
      status: 'Active',
      difficulty: 'Intermediate',
      instructor: 'Cassian Andor',
      maxScore: 100
    },
    { 
      id: '2', 
      title: 'Advanced TypeScript Safety', 
      course: 'TypeScript Fundamentals', 
      description: 'Define complex union types and generic interfaces for a global data transmission service.',
      dueDate: '2024-03-22', 
      submissions: 82, 
      totalStudents: 85,
      status: 'Reviewing',
      difficulty: 'Advanced',
      instructor: 'Jyn Erso',
      maxScore: 100
    },
    { 
      id: '3', 
      title: 'UI Component Design', 
      course: 'Advanced UI/UX Design', 
      description: 'Design a responsive glassmorphic grid system using modern CSS and premium design principles.',
      dueDate: '2024-03-18', 
      submissions: 120, 
      totalStudents: 120,
      status: 'graded',
      difficulty: 'Beginner',
      instructor: 'Jane Smith',
      score: 94,
      maxScore: 100,
      feedback: 'Exceptional structural integrity. The layout flow is optimal and the visual style is premium.'
    },
  ],
};

const assignmentSlice = createSlice({
  name: 'assignments',
  initialState,
  reducers: {
    addAssignment: (state, action: PayloadAction<Assignment>) => {
      state.assignments.unshift(action.payload);
    },
    updateAssignmentStatus: (state, action: PayloadAction<{ id: string; status: Assignment['status'] }>) => {
      const assignment = state.assignments.find(a => a.id === action.payload.id);
      if (assignment) {
        assignment.status = action.payload.status;
      }
    },
  },
});

export const { addAssignment, updateAssignmentStatus } = assignmentSlice.actions;
export default assignmentSlice.reducer;
