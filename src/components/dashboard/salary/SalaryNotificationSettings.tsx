
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Bell, Settings } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface NotificationSettings {
  delayNotifications: boolean;
  gracePeriodDays: number;
  upcomingNotifications: boolean;
  upcomingDaysBefore: number;
}

export const SalaryNotificationSettings = () => {
  const { toast } = useToast();
  
  // Load settings from localStorage or use defaults
  const loadSettings = (): NotificationSettings => {
    const saved = localStorage.getItem('salary-notification-settings');
    if (saved) {
      return JSON.parse(saved);
    }
    return {
      delayNotifications: true,
      gracePeriodDays: 2,
      upcomingNotifications: true,
      upcomingDaysBefore: 3,
    };
  };

  const [settings, setSettings] = useState<NotificationSettings>(loadSettings);

  const saveSettings = () => {
    localStorage.setItem('salary-notification-settings', JSON.stringify(settings));
    toast({
      title: "Settings Saved",
      description: "Your notification preferences have been updated.",
    });
  };

  const clearNotificationHistory = () => {
    // Clear all salary notification flags from localStorage
    const keys = Object.keys(localStorage);
    keys.forEach(key => {
      if (key.startsWith('salary-delay-') || key.startsWith('salary-upcoming-')) {
        localStorage.removeItem(key);
      }
    });

    toast({
      title: "Notification History Cleared",
      description: "You will receive fresh notifications based on your settings.",
    });
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="h-5 w-5" />
          Salary Notifications
        </CardTitle>
        <CardDescription>
          Configure when and how you want to be notified about your salary
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="delay-notifications">Delay Notifications</Label>
              <p className="text-sm text-muted-foreground">
                Get notified when your salary is overdue
              </p>
            </div>
            <Switch
              id="delay-notifications"
              checked={settings.delayNotifications}
              onCheckedChange={(checked) =>
                setSettings(prev => ({ ...prev, delayNotifications: checked }))
              }
            />
          </div>

          {settings.delayNotifications && (
            <div className="ml-4 space-y-2">
              <Label>Grace Period</Label>
              <Select
                value={settings.gracePeriodDays.toString()}
                onValueChange={(value) =>
                  setSettings(prev => ({ ...prev, gracePeriodDays: parseInt(value) }))
                }
              >
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1 day</SelectItem>
                  <SelectItem value="2">2 days</SelectItem>
                  <SelectItem value="3">3 days</SelectItem>
                  <SelectItem value="5">5 days</SelectItem>
                  <SelectItem value="7">7 days</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Days after expected date before showing delay notification
              </p>
            </div>
          )}

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="upcoming-notifications">Upcoming Notifications</Label>
              <p className="text-sm text-muted-foreground">
                Get notified when your salary is expected soon
              </p>
            </div>
            <Switch
              id="upcoming-notifications"
              checked={settings.upcomingNotifications}
              onCheckedChange={(checked) =>
                setSettings(prev => ({ ...prev, upcomingNotifications: checked }))
              }
            />
          </div>

          {settings.upcomingNotifications && (
            <div className="ml-4 space-y-2">
              <Label>Advance Notice</Label>
              <Select
                value={settings.upcomingDaysBefore.toString()}
                onValueChange={(value) =>
                  setSettings(prev => ({ ...prev, upcomingDaysBefore: parseInt(value) }))
                }
              >
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1 day</SelectItem>
                  <SelectItem value="2">2 days</SelectItem>
                  <SelectItem value="3">3 days</SelectItem>
                  <SelectItem value="5">5 days</SelectItem>
                  <SelectItem value="7">7 days</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Days before expected date to show upcoming notification
              </p>
            </div>
          )}
        </div>

        <div className="flex gap-2 pt-4 border-t">
          <Button onClick={saveSettings} className="flex-1">
            <Settings className="h-4 w-4 mr-2" />
            Save Settings
          </Button>
          <Button variant="outline" onClick={clearNotificationHistory}>
            Reset Notifications
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
