import dynamic from 'next/dynamic';

const AccountSearch = dynamic(() => import('../components/AccountSearch'), { ssr: false });

export default function Home() {
  return <AccountSearch />;
}