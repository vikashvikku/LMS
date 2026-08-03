"use client";

import { useState } from "react";
import { updateOrganizationProfileAction } from "@/actions/settings";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export function OrganizationForm({ organization }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  async function onSubmit(formData) {
    setIsSubmitting(true);
    setError("");
    setSuccess(false);

    const result = await updateOrganizationProfileAction(formData);

    if (result.error) {
      setError(result.error);
    } else {
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    }
    
    setIsSubmitting(false);
  }

  return (
    <form action={onSubmit} className="space-y-6">
      {error && (
        <div className="p-3 bg-red-100 text-red-600 rounded-md text-sm">
          {error}
        </div>
      )}
      {success && (
        <div className="p-3 bg-green-100 text-green-600 rounded-md text-sm">
          Organization profile updated successfully.
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="name">Organization Name <span className="text-red-500">*</span></Label>
          <Input id="name" name="name" defaultValue={organization?.name || ""} required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="code">Organization Code</Label>
          <Input id="code" name="code" defaultValue={organization?.code || ""} placeholder="e.g., UNIV-01" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="email">Official Email</Label>
          <Input id="email" name="email" type="email" defaultValue={organization?.email || ""} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="phone">Phone Number</Label>
          <Input id="phone" name="phone" type="tel" defaultValue={organization?.phone || ""} />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="website">Website URL</Label>
        <Input id="website" name="website" type="url" defaultValue={organization?.website || ""} placeholder="https://" />
      </div>

      <div className="space-y-2">
        <Label htmlFor="address">Street Address</Label>
        <Textarea id="address" name="address" defaultValue={organization?.address || ""} rows={3} />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        <div className="space-y-2">
          <Label htmlFor="city">City</Label>
          <Input id="city" name="city" defaultValue={organization?.city || ""} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="state">State / Province</Label>
          <Input id="state" name="state" defaultValue={organization?.state || ""} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="postal_code">Postal Code</Label>
          <Input id="postal_code" name="postal_code" defaultValue={organization?.postal_code || ""} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="country">Country</Label>
          <Input id="country" name="country" defaultValue={organization?.country || ""} />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="timezone">Time Zone</Label>
        <Input id="timezone" name="timezone" defaultValue={organization?.timezone || "UTC"} />
      </div>

      <div className="flex justify-end">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Saving..." : "Save Changes"}
        </Button>
      </div>
    </form>
  );
}
