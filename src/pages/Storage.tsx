
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { HardDrive } from 'lucide-react';

const Storage = () => {
  return (
    <div>
      <div className="flex items-center gap-4 mb-6">
        <HardDrive className="w-8 h-8" />
        <h1 className="text-3xl font-bold">Storage</h1>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Storage Management</CardTitle>
        </CardHeader>
        <CardContent>
          <p>This is where you can manage your storage. This feature is coming soon!</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default Storage;
