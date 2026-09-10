import { requireChatGPTUser } from '@/app/chatgpt-auth';
import AdminDashboard from '../admin-dashboard';
export const dynamic='force-dynamic';
export default async function AdminSection({params}:{params:Promise<{section:string}>}){const {section}=await params;const user=await requireChatGPTUser(`/admin/${section}`);return <AdminDashboard section={section} adminName={user.displayName}/>}
