
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/components/ui/use-toast';
import { UserRole } from '@/hooks/useAuth';

const AdminCreation = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState<'admin' | 'judge'>('admin');
  const { toast } = useToast();

  const handleCreateUser = async () => {
    try {
      // Validate inputs
      if (!email.trim() || !password.trim() || !name.trim()) {
        throw new Error("All fields are required");
      }
      
      if (password.length < 6) {
        throw new Error("Password must be at least 6 characters long");
      }

      // First create the auth user
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            role,
            name
          }
        }
      });

      if (error) throw error;

      if (!data.user) {
        throw new Error('Failed to create user account');
      }

      // Then create the profile record
      const { error: profileError } = await supabase
        .from('profiles')
        .insert([{
          id: data.user.id,
          name,
          email,
          role,
          created_at: new Date()
        }]);

      if (profileError) {
        console.error('Error creating profile:', profileError);
        // Continue anyway - will use auth metadata
      }

      toast({
        title: 'User Created',
        description: `New ${role} account created successfully`
      });

      // Reset form
      setEmail('');
      setPassword('');
      setName('');
    } catch (err) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: err instanceof Error ? err.message : 'An unknown error occurred'
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create Admin or Judge</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <Select value={role} onValueChange={(value: 'admin' | 'judge') => setRole(value)}>
            <SelectTrigger>
              <SelectValue placeholder="Select Role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="admin">Admin</SelectItem>
              <SelectItem value="judge">Judge</SelectItem>
            </SelectContent>
          </Select>

          <Input 
            type="text"
            placeholder="Full Name" 
            value={name}
            onChange={(e) => setName(e.target.value)}
          />

          <Input 
            type="email"
            placeholder="Email" 
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <Input 
            type="password"
            placeholder="Password" 
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <Button onClick={handleCreateUser}>Create User</Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default AdminCreation;
