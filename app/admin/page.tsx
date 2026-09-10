import { requireChatGPTUser } from '@/app/chatgpt-auth';
import AdminDashboard from './admin-dashboard';
export const dynamic='force-dynamic';
export default async function AdminPage(){const user=await requireChatGPTUser('/admin');return <AdminDashboard adminName={user.displayName}/>}
