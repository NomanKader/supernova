import {
  BadgeCheck,
  BookOpen,
  FileText,
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
  { title: 'Courses', href: `${adminBase}/courses`, icon: BookOpen },
  { title: 'Lessons', href: `${adminBase}/lessons`, icon: Layers2 },
  { title: 'Enrollments', href: `${adminBase}/enrollments`, icon: Wallet },
  { title: 'Progress', href: `${adminBase}/progress`, icon: LineChart },
  { title: 'Assessments', href: `${adminBase}/assessments`, icon: FileText },
  { title: 'Certificates', href: `${adminBase}/certificates`, icon: BadgeCheck },
  { title: 'Promotions', href: `${adminBase}/promotions`, icon: Megaphone },
  { title: 'Referrals', href: `${adminBase}/referrals`, icon: MessagesSquare },
];


