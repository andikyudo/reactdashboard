import { useState } from 'react';
import { useTheme } from '@/components/theme-provider';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

function Settings() {
  const { theme, setTheme } = useTheme();
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
      </div>
      
      <Tabs defaultValue="account" className="w-full">
        <div className="flex flex-col md:flex-row gap-6">
          <div className="md:w-64">
            <TabsList className="flex flex-col h-auto p-0 bg-transparent space-y-1">
              <TabsTrigger 
                value="account" 
                className="justify-start w-full px-4 py-2 data-[state=active]:bg-muted"
              >
                Account
              </TabsTrigger>
              <TabsTrigger 
                value="profile" 
                className="justify-start w-full px-4 py-2 data-[state=active]:bg-muted"
              >
                Profile
              </TabsTrigger>
              <TabsTrigger 
                value="notifications" 
                className="justify-start w-full px-4 py-2 data-[state=active]:bg-muted"
              >
                Notifications
              </TabsTrigger>
              <TabsTrigger 
                value="security" 
                className="justify-start w-full px-4 py-2 data-[state=active]:bg-muted"
              >
                Security
              </TabsTrigger>
              <TabsTrigger 
                value="appearance" 
                className="justify-start w-full px-4 py-2 data-[state=active]:bg-muted"
              >
                Appearance
              </TabsTrigger>
            </TabsList>
          </div>
          
          <div className="flex-1">
            <Card>
              <TabsContent value="account" className="m-0">
                <CardHeader>
                  <CardTitle>Account Settings</CardTitle>
                  <CardDescription>
                    Manage your account settings and preferences.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input id="email" defaultValue="user@example.com" />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="username">Username</Label>
                    <Input id="username" defaultValue="user123" />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="language">Language</Label>
                    <Select defaultValue="en">
                      <SelectTrigger id="language">
                        <SelectValue placeholder="Select language" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="en">English</SelectItem>
                        <SelectItem value="es">Spanish</SelectItem>
                        <SelectItem value="fr">French</SelectItem>
                        <SelectItem value="de">German</SelectItem>
                        <SelectItem value="id">Indonesian</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="timezone">Timezone</Label>
                    <Select defaultValue="utc">
                      <SelectTrigger id="timezone">
                        <SelectValue placeholder="Select timezone" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="utc">UTC</SelectItem>
                        <SelectItem value="est">Eastern Time (EST)</SelectItem>
                        <SelectItem value="cst">Central Time (CST)</SelectItem>
                        <SelectItem value="mst">Mountain Time (MST)</SelectItem>
                        <SelectItem value="pst">Pacific Time (PST)</SelectItem>
                        <SelectItem value="wib">Western Indonesian Time (WIB)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <Button className="mt-4">Save Changes</Button>
                </CardContent>
              </TabsContent>
              
              <TabsContent value="profile" className="m-0">
                <CardHeader>
                  <CardTitle>Profile Settings</CardTitle>
                  <CardDescription>
                    Update your profile information.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="fullname">Full Name</Label>
                    <Input id="fullname" defaultValue="John Doe" />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="bio">Bio</Label>
                    <Textarea 
                      id="bio" 
                      rows={4} 
                      defaultValue="Product manager with 5 years of experience in SaaS products."
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Profile Picture</Label>
                    <div className="flex items-center gap-4">
                      <Avatar className="h-16 w-16">
                        <AvatarImage src="https://github.com/shadcn.png" alt="User" />
                        <AvatarFallback>JD</AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col gap-2">
                        <Input id="avatar" type="file" />
                        <Button variant="outline" size="sm">Upload New Picture</Button>
                      </div>
                    </div>
                  </div>
                  
                  <Button className="mt-4">Save Changes</Button>
                </CardContent>
              </TabsContent>
              
              <TabsContent value="notifications" className="m-0">
                <CardHeader>
                  <CardTitle>Notification Settings</CardTitle>
                  <CardDescription>
                    Configure how you receive notifications.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox id="email-notifications" defaultChecked />
                    <Label htmlFor="email-notifications">Email Notifications</Label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Checkbox id="push-notifications" defaultChecked />
                    <Label htmlFor="push-notifications">Push Notifications</Label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Checkbox id="sms-notifications" />
                    <Label htmlFor="sms-notifications">SMS Notifications</Label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Checkbox id="marketing-emails" />
                    <Label htmlFor="marketing-emails">Marketing Emails</Label>
                  </div>
                  
                  <Button className="mt-4">Save Changes</Button>
                </CardContent>
              </TabsContent>
              
              <TabsContent value="security" className="m-0">
                <CardHeader>
                  <CardTitle>Security Settings</CardTitle>
                  <CardDescription>
                    Update your password and security preferences.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="current-password">Current Password</Label>
                    <Input id="current-password" type="password" />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="new-password">New Password</Label>
                    <Input id="new-password" type="password" />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="confirm-password">Confirm New Password</Label>
                    <Input id="confirm-password" type="password" />
                  </div>
                  
                  <div className="flex items-center space-x-2 pt-2">
                    <Checkbox id="two-factor" />
                    <Label htmlFor="two-factor">Enable Two-Factor Authentication</Label>
                  </div>
                  
                  <Button className="mt-4">Update Password</Button>
                </CardContent>
              </TabsContent>
              
              <TabsContent value="appearance" className="m-0">
                <CardHeader>
                  <CardTitle>Appearance Settings</CardTitle>
                  <CardDescription>
                    Customize the appearance of the application.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Theme</Label>
                    <RadioGroup 
                      defaultValue={theme} 
                      onValueChange={setTheme}
                      className="flex flex-col space-y-1"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="light" id="light-theme" />
                        <Label htmlFor="light-theme">Light</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="dark" id="dark-theme" />
                        <Label htmlFor="dark-theme">Dark</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="system" id="system-theme" />
                        <Label htmlFor="system-theme">System Default</Label>
                      </div>
                    </RadioGroup>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="font-size">Font Size</Label>
                    <Select defaultValue="medium">
                      <SelectTrigger id="font-size">
                        <SelectValue placeholder="Select font size" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="small">Small</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="large">Large</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <Button className="mt-4">Save Changes</Button>
                </CardContent>
              </TabsContent>
            </Card>
          </div>
        </div>
      </Tabs>
    </div>
  );
}

export default Settings;
