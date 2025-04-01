
import { format, addDays, subDays, addMonths } from 'date-fns';

// Types
export type CaseStatus = 'pending' | 'active' | 'closed' | 'appealed';
export type CaseType = 'civil' | 'criminal' | 'family' | 'corporate';

export interface Case {
  id: string;
  caseNumber: string;
  title: string;
  description: string;
  type: CaseType;
  status: CaseStatus;
  filingDate: string;
  clientId: string;
  lawyerId: string;
  judgeId: string;
  courtroom: string;
}

export interface Hearing {
  id: string;
  caseId: string;
  date: string;
  time: string;
  courtroom: string;
  duration: number; // in minutes
  description: string;
  status: 'scheduled' | 'completed' | 'cancelled' | 'postponed';
}

export interface Person {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: 'lawyer' | 'judge' | 'client';
  specialization?: string;
  imageUrl?: string;
}

// Generate mock data
const lawyers: Person[] = [
  {
    id: '1',
    name: 'Jane Smith',
    email: 'jsmith@law.com',
    phone: '(555) 123-4567',
    role: 'lawyer',
    specialization: 'Criminal Law',
    imageUrl: '/placeholder.svg'
  },
  {
    id: '2',
    name: 'Michael Johnson',
    email: 'mjohnson@law.com',
    phone: '(555) 234-5678',
    role: 'lawyer',
    specialization: 'Civil Law',
    imageUrl: '/placeholder.svg'
  },
  {
    id: '3',
    name: 'Sarah Williams',
    email: 'swilliams@law.com',
    phone: '(555) 345-6789',
    role: 'lawyer',
    specialization: 'Family Law',
    imageUrl: '/placeholder.svg'
  }
];

const judges: Person[] = [
  {
    id: '1',
    name: 'Hon. Robert Davis',
    email: 'rdavis@courts.gov',
    phone: '(555) 456-7890',
    role: 'judge',
    imageUrl: '/placeholder.svg'
  },
  {
    id: '2',
    name: 'Hon. Patricia Garcia',
    email: 'pgarcia@courts.gov',
    phone: '(555) 567-8901',
    role: 'judge',
    imageUrl: '/placeholder.svg'
  },
  {
    id: '3',
    name: 'Hon. James Wilson',
    email: 'jwilson@courts.gov',
    phone: '(555) 678-9012',
    role: 'judge',
    imageUrl: '/placeholder.svg'
  }
];

const clients: Person[] = [
  {
    id: '1',
    name: 'Thomas Brown',
    email: 'tbrown@example.com',
    phone: '(555) 789-0123',
    role: 'client',
    imageUrl: '/placeholder.svg'
  },
  {
    id: '2',
    name: 'Emily Clark',
    email: 'eclark@example.com',
    phone: '(555) 890-1234',
    role: 'client',
    imageUrl: '/placeholder.svg'
  },
  {
    id: '3',
    name: 'David Miller',
    email: 'dmiller@example.com',
    phone: '(555) 901-2345',
    role: 'client',
    imageUrl: '/placeholder.svg'
  },
  {
    id: '4',
    name: 'Jennifer Lee',
    email: 'jlee@example.com',
    phone: '(555) 012-3456',
    role: 'client',
    imageUrl: '/placeholder.svg'
  }
];

const today = new Date();

const cases: Case[] = [
  {
    id: '1',
    caseNumber: 'CR-2023-1001',
    title: 'State v. Johnson',
    description: 'Criminal case involving alleged fraud',
    type: 'criminal',
    status: 'active',
    filingDate: format(subDays(today, 45), 'yyyy-MM-dd'),
    clientId: '1',
    lawyerId: '1',
    judgeId: '1',
    courtroom: 'Courtroom 3A'
  },
  {
    id: '2',
    caseNumber: 'CV-2023-2002',
    title: 'Clark v. XYZ Corporation',
    description: 'Civil lawsuit for breach of contract',
    type: 'civil',
    status: 'pending',
    filingDate: format(subDays(today, 30), 'yyyy-MM-dd'),
    clientId: '2',
    lawyerId: '2',
    judgeId: '2',
    courtroom: 'Courtroom 2B'
  },
  {
    id: '3',
    caseNumber: 'FM-2023-3003',
    title: 'Miller Divorce Proceedings',
    description: 'Family court case for divorce settlement',
    type: 'family',
    status: 'active',
    filingDate: format(subDays(today, 60), 'yyyy-MM-dd'),
    clientId: '3',
    lawyerId: '3',
    judgeId: '3',
    courtroom: 'Courtroom 1A'
  },
  {
    id: '4',
    caseNumber: 'CR-2023-1004',
    title: 'State v. Adams',
    description: 'Criminal case involving theft',
    type: 'criminal',
    status: 'closed',
    filingDate: format(subDays(today, 90), 'yyyy-MM-dd'),
    clientId: '4',
    lawyerId: '1',
    judgeId: '1',
    courtroom: 'Courtroom 3A'
  },
  {
    id: '5',
    caseNumber: 'CV-2023-2005',
    title: 'Lee v. ABC Inc.',
    description: 'Civil lawsuit for personal injury',
    type: 'civil',
    status: 'appealed',
    filingDate: format(subDays(today, 120), 'yyyy-MM-dd'),
    clientId: '4',
    lawyerId: '2',
    judgeId: '2',
    courtroom: 'Courtroom 2B'
  },
  {
    id: '6',
    caseNumber: 'CP-2023-4006',
    title: 'NextGen Merger Review',
    description: 'Corporate law case for merger approval',
    type: 'corporate',
    status: 'pending',
    filingDate: format(subDays(today, 15), 'yyyy-MM-dd'),
    clientId: '2',
    lawyerId: '2',
    judgeId: '3',
    courtroom: 'Courtroom 4C'
  }
];

const hearings: Hearing[] = [
  {
    id: '1',
    caseId: '1',
    date: format(addDays(today, 7), 'yyyy-MM-dd'),
    time: '09:00',
    courtroom: 'Courtroom 3A',
    duration: 60,
    description: 'Initial hearing',
    status: 'scheduled'
  },
  {
    id: '2',
    caseId: '2',
    date: format(addDays(today, 14), 'yyyy-MM-dd'),
    time: '10:30',
    courtroom: 'Courtroom 2B',
    duration: 90,
    description: 'Preliminary hearing',
    status: 'scheduled'
  },
  {
    id: '3',
    caseId: '3',
    date: format(addDays(today, 2), 'yyyy-MM-dd'),
    time: '13:00',
    courtroom: 'Courtroom 1A',
    duration: 120,
    description: 'Settlement conference',
    status: 'scheduled'
  },
  {
    id: '4',
    caseId: '1',
    date: format(addDays(today, 21), 'yyyy-MM-dd'),
    time: '14:00',
    courtroom: 'Courtroom 3A',
    duration: 180,
    description: 'Trial',
    status: 'scheduled'
  },
  {
    id: '5',
    caseId: '3',
    date: format(addDays(today, 10), 'yyyy-MM-dd'),
    time: '11:00',
    courtroom: 'Courtroom 1A',
    duration: 60,
    description: 'Motion hearing',
    status: 'scheduled'
  },
  {
    id: '6',
    caseId: '4',
    date: format(subDays(today, 5), 'yyyy-MM-dd'),
    time: '09:30',
    courtroom: 'Courtroom 3A',
    duration: 45,
    description: 'Sentencing',
    status: 'completed'
  },
  {
    id: '7',
    caseId: '6',
    date: format(addDays(today, 1), 'yyyy-MM-dd'),
    time: '15:00',
    courtroom: 'Courtroom 4C',
    duration: 60,
    description: 'Initial review',
    status: 'scheduled'
  }
];

const documents = [
  {
    id: '1',
    caseId: '1',
    title: 'Indictment',
    description: 'Formal charges against defendant',
    uploadDate: format(subDays(today, 42), 'yyyy-MM-dd'),
    uploadedBy: 'Jane Smith',
    fileType: 'pdf',
    fileSize: '1.2 MB'
  },
  {
    id: '2',
    caseId: '1',
    title: 'Police Report',
    description: 'Official police incident report',
    uploadDate: format(subDays(today, 40), 'yyyy-MM-dd'),
    uploadedBy: 'Jane Smith',
    fileType: 'pdf',
    fileSize: '3.5 MB'
  },
  {
    id: '3',
    caseId: '2',
    title: 'Complaint',
    description: 'Initial civil complaint filing',
    uploadDate: format(subDays(today, 30), 'yyyy-MM-dd'),
    uploadedBy: 'Michael Johnson',
    fileType: 'docx',
    fileSize: '0.8 MB'
  },
  {
    id: '4',
    caseId: '2',
    title: 'Evidence Exhibit A',
    description: 'Contract documents',
    uploadDate: format(subDays(today, 25), 'yyyy-MM-dd'),
    uploadedBy: 'Michael Johnson',
    fileType: 'pdf',
    fileSize: '5.2 MB'
  },
  {
    id: '5',
    caseId: '3',
    title: 'Petition for Divorce',
    description: 'Initial divorce filing',
    uploadDate: format(subDays(today, 58), 'yyyy-MM-dd'),
    uploadedBy: 'Sarah Williams',
    fileType: 'pdf',
    fileSize: '1.0 MB'
  },
  {
    id: '6',
    caseId: '3',
    title: 'Financial Disclosure',
    description: 'Asset and liability disclosure',
    uploadDate: format(subDays(today, 45), 'yyyy-MM-dd'),
    uploadedBy: 'Sarah Williams',
    fileType: 'xlsx',
    fileSize: '2.3 MB'
  }
];

// Data access functions
export const getCases = (): Case[] => cases;

export const getCaseById = (id: string): Case | undefined => {
  return cases.find(c => c.id === id);
};

export const getPersonById = (id: string, role?: string): Person | undefined => {
  if (role === 'lawyer') {
    return lawyers.find(l => l.id === id);
  } else if (role === 'judge') {
    return judges.find(j => j.id === id);
  } else if (role === 'client') {
    return clients.find(c => c.id === id);
  }
  
  // If no role specified, search all
  return [...lawyers, ...judges, ...clients].find(p => p.id === id);
};

export const getHearingsByCaseId = (caseId: string): Hearing[] => {
  return hearings.filter(h => h.caseId === caseId);
};

export const getAllHearings = (): Hearing[] => hearings;

export const getUpcomingHearings = (): Hearing[] => {
  return hearings.filter(h => new Date(h.date) >= today && h.status === 'scheduled')
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
};

export const getDocumentsByCaseId = (caseId: string) => {
  return documents.filter(d => d.caseId === caseId);
};

export const getCasesByLawyer = (lawyerId: string): Case[] => {
  return cases.filter(c => c.lawyerId === lawyerId);
};

export const getCasesByJudge = (judgeId: string): Case[] => {
  return cases.filter(c => c.judgeId === judgeId);
};

export const getCasesByClient = (clientId: string): Case[] => {
  return cases.filter(c => c.clientId === clientId);
};

export const getLawyers = (): Person[] => lawyers;
export const getJudges = (): Person[] => judges;
export const getClients = (): Person[] => clients;

export const getCaseStats = () => {
  return {
    totalCases: cases.length,
    activeCases: cases.filter(c => c.status === 'active').length,
    pendingCases: cases.filter(c => c.status === 'pending').length,
    closedCases: cases.filter(c => c.status === 'closed').length,
    appealedCases: cases.filter(c => c.status === 'appealed').length,
    casesByType: {
      civil: cases.filter(c => c.type === 'civil').length,
      criminal: cases.filter(c => c.type === 'criminal').length,
      family: cases.filter(c => c.type === 'family').length,
      corporate: cases.filter(c => c.type === 'corporate').length,
    },
    upcomingHearings: getUpcomingHearings().length
  };
};
