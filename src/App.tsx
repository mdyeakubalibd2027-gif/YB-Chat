import React, { useState } from 'react';
import { WhatsAppProvider, useWhatsApp } from './context/WhatsAppContext';
import { AuthScreen } from './components/AuthScreen';
import { NavigationRail } from './components/NavigationRail';
import { ChatList } from './components/ChatList';
import { ChatWindow } from './components/ChatWindow';
import { StatusTab } from './components/StatusTab';
import { CallsTab } from './components/CallsTab';
import { ProfileDrawer } from './components/ProfileDrawer';
import { NewGroupModal } from './components/NewGroupModal';
import { NewContactModal } from './components/NewContactModal';
import { CallModal } from './components/CallModal';
import { NotificationToastContainer } from './components/NotificationToastContainer';

const MainLayout: React.FC = () => {
  const { currentUser, activeChatId, theme } = useWhatsApp();
  const [currentTab, setCurrentTab] = useState<'chats' | 'status' | 'calls'>('chats');
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isNewGroupOpen, setIsNewGroupOpen] = useState(false);
  const [isNewContactOpen, setIsNewContactOpen] = useState(false);

  // If user is not logged in, render the Auth Screen immediately upon entering
  if (!currentUser) {
    return <AuthScreen />;
  }

  const isDark = theme === 'dark';

  return (
    <div
      className={`flex h-screen w-screen overflow-hidden ${
        isDark ? 'bg-[#111b21] text-[#e9edef]' : 'bg-[#f0f2f5] text-gray-900'
      }`}
    >
      {/* Toast Notification Container */}
      <NotificationToastContainer />

      {/* Call Simulation Modal */}
      <CallModal />

      {/* Left Icon Navigation Rail (Desktop sidebar / Mobile bottom bar) */}
      <NavigationRail
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        openProfile={() => setIsProfileOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 flex h-full min-w-0 overflow-hidden relative pb-16 md:pb-0">
        {/* Tab 1: Chats */}
        {currentTab === 'chats' && (
          <div className="flex-1 flex h-full min-w-0 overflow-hidden">
            {/* Chat List: On mobile, hide when a chat is open */}
            <div
              className={`h-full w-full md:w-auto ${
                activeChatId ? 'hidden md:flex' : 'flex'
              }`}
            >
              <ChatList
                onOpenNewContact={() => setIsNewContactOpen(true)}
                onOpenNewGroup={() => setIsNewGroupOpen(true)}
              />
            </div>

            {/* Chat Window: On mobile, hide when no chat is open */}
            <div
              className={`h-full flex-1 min-w-0 ${
                activeChatId ? 'flex' : 'hidden md:flex'
              }`}
            >
              <ChatWindow />
            </div>
          </div>
        )}

        {/* Tab 2: Status / Stories */}
        {currentTab === 'status' && (
          <div className="flex-1 h-full min-w-0 overflow-hidden">
            <StatusTab />
          </div>
        )}

        {/* Tab 3: Calls History */}
        {currentTab === 'calls' && (
          <div className="flex-1 h-full min-w-0 overflow-hidden">
            <CallsTab />
          </div>
        )}
      </main>

      {/* Modals & Drawers */}
      {isProfileOpen && <ProfileDrawer onClose={() => setIsProfileOpen(false)} />}
      {isNewGroupOpen && <NewGroupModal onClose={() => setIsNewGroupOpen(false)} />}
      {isNewContactOpen && <NewContactModal onClose={() => setIsNewContactOpen(false)} />}
    </div>
  );
};

export default function App() {
  return (
    <WhatsAppProvider>
      <MainLayout />
    </WhatsAppProvider>
  );
}
