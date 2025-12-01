import {
  BadgeCheck,
  BookOpen,
  FileText,
  FolderKanban,
  Home,
  Layers2,
  LineChart,
  Megaphone,
  MessagesSquare,
  Users,
  Wallet,
} from 'lucide-react';

const adminBase = '/admin';

export const navLinks = [
  { title: 'Overview', href: `${adminBase}`, icon: Home },
  { title: 'Users', href: `${adminBase}/users`, icon: Users },
  { title: 'Customers', href: `${adminBase}/customers`, icon: MessagesSquare },
  { title: 'Courses', href: `${adminBase}/courses`, icon: BookOpen },
  { title: 'Course categories', href: `${adminBase}/course-categories`, icon: FolderKanban },
  { title: 'Lessons', href: `${adminBase}/lessons`, icon: Layers2 },
  { title: 'Enrollments', href: `${adminBase}/enrollments`, icon: Wallet },
  { title: 'Progress', href: `${adminBase}/progress`, icon: LineChart },
  { title: 'Assessments', href: `${adminBase}/assessments`, icon: FileText },
  { title: 'Certificates', href: `${adminBase}/certificates`, icon: BadgeCheck },
  { title: 'Promotions', href: `${adminBase}/promotions`, icon: Megaphone },
  { title: 'Referrals', href: `${adminBase}/referrals`, icon: MessagesSquare },
];
