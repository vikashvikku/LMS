"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { updateBrandingSettingsAction } from "@/actions/settings";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export function BrandingForm({ settings }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [primary, setPrimary] = useState(settings?.branding_primary_color || "#0f172a");
  const [secondary, setSecondary] = useState(settings?.branding_secondary_color || "#334155");
  const [logoUrl, setLogoUrl] = useState(settings?.branding_logo_url || "");

  async function handleSubmit(e) {
    e.preventDefault();
    setIsSubmitting(true);
    
    const formData = new FormData();
    formData.append("primary_color", primary);
    formData.append("secondary_color", secondary);
    formData.append("logo_url", logoUrl);

    const res = await updateBrandingSettingsAction(formData);
    
    if (res.error) alert(res.error);
    else alert("Branding settings updated successfully");
    
    setIsSubmitting(false);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-4">
          <Label>Primary Color</Label>
          <div className="flex items-center space-x-4">
            <Input 
              type="color" 
              value={primary} 
              onChange={e => setPrimary(e.target.value)} 
              className="w-16 h-12 p-1 cursor-pointer"
            />
            <Input 
              type="text" 
              value={primary} 
              onChange={e => setPrimary(e.target.value)} 
              className="w-32 font-mono"
            />
          </div>
          <p className="text-xs text-muted-foreground">Used for main buttons and active states.</p>
        </div>

        <div className="space-y-4">
          <Label>Secondary Color</Label>
          <div className="flex items-center space-x-4">
            <Input 
              type="color" 
              value={secondary} 
              onChange={e => setSecondary(e.target.value)} 
              className="w-16 h-12 p-1 cursor-pointer"
            />
            <Input 
              type="text" 
              value={secondary} 
              onChange={e => setSecondary(e.target.value)} 
              className="w-32 font-mono"
            />
          </div>
          <p className="text-xs text-muted-foreground">Used for secondary accents and backgrounds.</p>
        </div>
      </div>

      <div className="space-y-4 pt-4 border-t">
        <Label>Organization Logo URL</Label>
        <div className="flex items-center space-x-4">
          <Avatar className="w-16 h-16 rounded-md">
            <AvatarImage src={logoUrl} className="object-contain" />
            <AvatarFallback className="rounded-md">LOGO</AvatarFallback>
          </Avatar>
          <div className="flex-1 space-y-2">
            <Input 
              placeholder="https://example.com/logo.png" 
              value={logoUrl} 
              onChange={e => setLogoUrl(e.target.value)} 
            />
            <p className="text-xs text-muted-foreground">Provide a URL for your logo. Upload via storage is also supported if configured.</p>
          </div>
        </div>
      </div>

      <div className="flex justify-end pt-4">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Saving..." : "Save Branding"}
        </Button>
      </div>
    </form>
  );
}
