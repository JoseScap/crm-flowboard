import { UserSettingsHomeProvider, useUserSettingsHomeContext } from './UserSettingsHomeContext';
import { UserSettingsHomeHeader } from './components/UserSettingsHomeHeader';
import { UserSettingsHomeEmptyState } from './components/UserSettingsHomeEmptyState';
import { UserSettingsHomeGrid } from './components/UserSettingsHomeGrid';
import { UserSettingsHomeLoading } from './components/UserSettingsHomeLoading';

const UserSettingsHome = () => {
  const { loadingData, apiKeysMetadata } = useUserSettingsHomeContext();

  if (loadingData) {
    return <UserSettingsHomeLoading />;
  }

  return (
    <div className="p-6 lg:p-8 h-full">
      <UserSettingsHomeHeader />
      {apiKeysMetadata.length === 0 ? (
        <UserSettingsHomeEmptyState />
      ) : (
        <div className="w-full">
          <UserSettingsHomeGrid />
        </div>
      )}
    </div>
  );
};

const UserSettingsHomePage = () => {
  return (
    <UserSettingsHomeProvider>
      <UserSettingsHome />
    </UserSettingsHomeProvider>
  );
};

export default UserSettingsHomePage;

