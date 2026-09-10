import AttendeeFlow from '@/components/attendee-flow';

export const dynamic = 'force-dynamic';

export default async function SessionPage({
  params,
}: {
  params: Promise<{ sessionId: string }>;
}) {
  const { sessionId } = await params;
  return <AttendeeFlow sessionId={sessionId} />;
}
