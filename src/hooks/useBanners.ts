import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { syncService } from '../lib/syncService';

export interface Banner {
  id: string;
  title: string;
  subtitle?: string;
  tagText: string;
  bgColor?: string;
  textColor?: string;
  tagBg?: string;
  tagColor?: string;
  branchSlug?: string; // 'all' | 'kollam' | 'alappuzha' | 'varkala'
  isActive?: boolean;
  createdAt?: number;
}

const starterBanners: Banner[] = [
  {
    id: 'starter-1',
    title: 'Buy 2 Mojitos Get 1 Free',
    subtitle: 'Available all weekend long. Perfect for a sunset by the lake.',
    bgColor: 'bg-amber-50',
    textColor: 'text-amber-950',
    tagText: "Today's Special",
    tagBg: 'bg-amber-200',
    tagColor: 'text-amber-900',
    branchSlug: 'all',
    isActive: true,
    createdAt: Date.now() - 2000,
  },
  {
    id: 'starter-2',
    title: 'Live Music Night',
    subtitle: 'Join us this Friday for an acoustic night under the stars.',
    bgColor: 'bg-blue-50',
    textColor: 'text-blue-950',
    tagText: 'Upcoming Event',
    tagBg: 'bg-blue-200',
    tagColor: 'text-blue-900',
    branchSlug: 'all',
    isActive: true,
    createdAt: Date.now() - 1000,
  }
];

const BANNER_STORAGE_KEY = 'asado_cached_banners_v1';

function getStoredBanners(): Banner[] {
  if (typeof window === 'undefined') return starterBanners;
  try {
    const raw = localStorage.getItem(BANNER_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch {
    // ignore
  }
  return starterBanners;
}

function saveStoredBanners(banners: Banner[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(BANNER_STORAGE_KEY, JSON.stringify(banners));
  } catch (err) {
    console.warn('Failed to save banners to localStorage:', err);
  }
}

function rowToBanner(r: any): Banner {
  return {
    id: r.id,
    branchSlug: r.branch_slug || 'all',
    title: r.title || '',
    subtitle: r.subtitle || '',
    tagText: r.tag_text || "Today's Special",
    bgColor: r.bg_color || 'bg-amber-50',
    textColor: r.text_color || 'text-amber-950',
    tagBg: r.tag_bg || 'bg-amber-200',
    tagColor: r.tag_color || 'text-amber-900',
    isActive: r.active !== false,
    createdAt: r.created_at ? new Date(r.created_at).getTime() : Date.now()
  };
}

export function useBanners(branchSlug?: string, options?: { includeInactive?: boolean }) {
  const [allBanners, setAllBanners] = useState<Banner[]>(getStoredBanners);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Fetch from Supabase
    const fetchBanners = async () => {
      try {
        const { data, error } = await supabase
          .from('banners')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) {
          console.warn('Supabase banners query warning:', error.message);
          return;
        }

        if (Array.isArray(data) && data.length > 0) {
          const mapped = data.map(rowToBanner);
          setAllBanners(mapped);
          saveStoredBanners(mapped);
        }
      } catch (err) {
        console.warn('Error fetching banners:', err);
      }
    };

    fetchBanners();

    // Subscribe to real-time banner changes
    const channel = supabase
      .channel('banners_sync')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'banners' },
        () => {
          fetchBanners();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // Filter for display
  let filtered: Banner[] = [];

  if (branchSlug) {
    const branchSpecific = allBanners.filter(b => b.branchSlug === branchSlug || b.id === `banner-${branchSlug}`);
    if (branchSpecific.length > 0) {
      filtered = options?.includeInactive 
        ? branchSpecific 
        : branchSpecific.filter(b => b.isActive !== false);
    } else {
      const globalBanners = allBanners.filter(b => !b.branchSlug || b.branchSlug === 'all');
      filtered = options?.includeInactive 
        ? globalBanners 
        : globalBanners.filter(b => b.isActive !== false);
    }
  } else {
    if (!options?.includeInactive) {
      filtered = allBanners.filter(b => b.isActive !== false);
    } else {
      filtered = allBanners;
    }
  }

  const addBanner = async (banner: Partial<Banner>) => {
    const id = banner.id || (banner.branchSlug && banner.branchSlug !== 'all' ? `banner-${banner.branchSlug}` : 'banner-' + Date.now().toString());
    const newBanner: Banner = {
      id,
      title: banner.title || '',
      subtitle: banner.subtitle || '',
      tagText: banner.tagText || "Today's Special",
      bgColor: banner.bgColor || 'bg-amber-50',
      textColor: banner.textColor || 'text-amber-950',
      tagBg: banner.tagBg || 'bg-amber-200',
      tagColor: banner.tagColor || 'text-amber-900',
      branchSlug: banner.branchSlug || 'all',
      isActive: banner.isActive !== undefined ? banner.isActive : true,
      createdAt: banner.createdAt || Date.now(),
    };

    setAllBanners(prev => {
      const next = [newBanner, ...prev.filter(b => b.id !== id)];
      saveStoredBanners(next);
      return next;
    });

    syncService.sendUpdate(newBanner.branchSlug || 'all', 'banner', newBanner);

    try {
      await supabase.from('banners').upsert({
        id,
        branch_slug: newBanner.branchSlug,
        title: newBanner.title,
        subtitle: newBanner.subtitle || '',
        tag_text: newBanner.tagText,
        bg_color: newBanner.bgColor,
        text_color: newBanner.textColor,
        tag_bg: newBanner.tagBg,
        tag_color: newBanner.tagColor,
        active: newBanner.isActive !== false
      });
    } catch (error) {
      console.warn('Supabase banner create error:', error);
    }
    return id;
  };

  const updateBanner = async (id: string, updates: Partial<Banner>) => {
    let updatedBanner: Banner | null = null;
    setAllBanners(prev => {
      const next = prev.map(b => {
        if (b.id === id) {
          updatedBanner = { ...b, ...updates };
          return updatedBanner;
        }
        return b;
      });
      saveStoredBanners(next);
      return next;
    });

    if (updatedBanner) {
      syncService.sendUpdate((updatedBanner as Banner).branchSlug || 'all', 'banner', updatedBanner);
    }

    try {
      const rowUpdates: any = {};
      if (updates.title !== undefined) rowUpdates.title = updates.title;
      if (updates.subtitle !== undefined) rowUpdates.subtitle = updates.subtitle;
      if (updates.tagText !== undefined) rowUpdates.tag_text = updates.tagText;
      if (updates.bgColor !== undefined) rowUpdates.bg_color = updates.bgColor;
      if (updates.textColor !== undefined) rowUpdates.text_color = updates.textColor;
      if (updates.tagBg !== undefined) rowUpdates.tag_bg = updates.tagBg;
      if (updates.tagColor !== undefined) rowUpdates.tag_color = updates.tagColor;
      if (updates.isActive !== undefined) rowUpdates.active = updates.isActive;
      if (updates.branchSlug !== undefined) rowUpdates.branch_slug = updates.branchSlug;

      await supabase.from('banners').update(rowUpdates).eq('id', id);
    } catch (error) {
      console.warn('Supabase banner update error:', error);
    }
  };

  const toggleBanner = async (id: string, newActiveState: boolean) => {
    setAllBanners(prev => {
      const next = prev.map(b => {
        if (b.id === id) return { ...b, isActive: newActiveState };
        return b;
      });
      saveStoredBanners(next);
      return next;
    });

    try {
      await supabase.from('banners').update({ active: newActiveState }).eq('id', id);
    } catch (error) {
      console.warn('Supabase banner toggle error:', error);
    }
  };

  const removeBanner = async (id: string) => {
    setAllBanners(prev => {
      const next = prev.filter(b => b.id !== id);
      saveStoredBanners(next);
      return next;
    });

    try {
      await supabase.from('banners').delete().eq('id', id);
    } catch (error) {
      console.warn('Supabase banner delete error:', error);
    }
  };

  return {
    banners: filtered,
    allBanners,
    loading,
    addBanner,
    updateBanner,
    toggleBanner,
    removeBanner
  };
}
