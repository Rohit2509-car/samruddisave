  import {
  UserProfile,
  UserRole,
  KYCStatus,
  Membership,
  ContributionRecord,
  MaturityPayout,
  SupportTicket,
  SavingsCircle,
  AuditLog,
  GiftHamper,
  NotificationItem,
  MemberLedgerEntry,
  ChitGroup,
  ChitGroupMember,
  ChitAuction,
  ChitBid
} from '../types';
import {
  INITIAL_PROFILES,
  INITIAL_MEMBERSHIPS,
  INITIAL_CONTRIBUTIONS,
  INITIAL_MATURITY_PAYOUTS,
  INITIAL_TICKETS,
  INITIAL_SAVINGS_CIRCLES,
  INITIAL_AUDIT_LOGS,
  INITIAL_CHIT_GROUPS,
  INITIAL_AUCTIONS,
  SAVINGS_PLANS,
  GIFT_HAMPERS
} from '../data/mockData';

import { supabase } from '../lib/supabase';
import { PasswordMetadataService } from '../services/PasswordMetadataService';

const STORAGE_KEYS = {
  CURRENT_USER_ID: 'samruddisave_current_user_id',
  PROFILES: 'samruddisave_profiles',
  MEMBERSHIPS: 'samruddisave_memberships',
  CONTRIBUTIONS: 'samruddisave_contributions',
  PAYOUTS: 'samruddisave_payouts',
  TICKETS: 'samruddisave_tickets',
  CIRCLES: 'samruddisave_circles',
  AUDIT_LOGS: 'samruddisave_audit_logs',
  ESCROW_BALANCE: 'samruddisave_escrow_balance',
};

type Listener = () => void;

class StateStore {
  private listeners: Set<Listener> = new Set();
  private profiles: UserProfile[] = [];
  private memberships: Membership[] = [];
  private contributions: ContributionRecord[] = [];
  private payouts: MaturityPayout[] = [];
  private tickets: SupportTicket[] = [];
  private circles: SavingsCircle[] = [];
  private auditLogs: AuditLog[] = [];
  private chitGroups: ChitGroup[] = INITIAL_CHIT_GROUPS;
  private chitGroupMembers: ChitGroupMember[] = [];
  private auctions: ChitAuction[] = INITIAL_AUCTIONS;
  private bids: ChitBid[] = [];
  private escrowBalance: number = 4850000;
  private currentUserId: string | null = localStorage.getItem(STORAGE_KEYS.CURRENT_USER_ID) || null;

  constructor() {
    this.loadFromStorage();
    this.initSupabaseAuthListener();
    this.syncWithSupabase();
  }

  private async initSupabaseAuthListener() {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        this.currentUserId = session.user.id;
        localStorage.setItem(STORAGE_KEYS.CURRENT_USER_ID, session.user.id);
        const metaName = session.user.user_metadata?.full_name || session.user.user_metadata?.fullName;
        if (metaName) {
          const user = this.profiles.find((p) => p.id === session.user.id || (p.email && p.email.toLowerCase() === session.user.email?.toLowerCase()));
          if (user && (!user.full_name || user.full_name === 'Member')) {
            user.full_name = metaName;
          }
        }
        this.notify();
      }

      supabase.auth.onAuthStateChange((event, session) => {
        if ((event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') && session?.user) {
          this.currentUserId = session.user.id;
          localStorage.setItem(STORAGE_KEYS.CURRENT_USER_ID, session.user.id);
          const metaName = session.user.user_metadata?.full_name || session.user.user_metadata?.fullName;
          if (metaName) {
            const user = this.profiles.find((p) => p.id === session.user.id || (p.email && p.email.toLowerCase() === session.user.email?.toLowerCase()));
            if (user && (!user.full_name || user.full_name === 'Member')) {
              user.full_name = metaName;
            }
          }
          this.saveToStorage();
        } else if (event === 'SIGNED_OUT') {
          this.currentUserId = null;
          localStorage.removeItem(STORAGE_KEYS.CURRENT_USER_ID);
          this.saveToStorage();
        }
      });
    } catch (e) {
      console.warn('Supabase auth listener initialization warning:', e);
    }
  }

  public async registerOrUpdateProfile(profile: UserProfile, password?: string): Promise<UserProfile> {
    const existingIdx = this.profiles.findIndex(
      (p) => p.id === profile.id || (p.email && p.email.toLowerCase() === profile.email.toLowerCase())
    );

    if (existingIdx >= 0) {
      this.profiles[existingIdx] = { ...this.profiles[existingIdx], ...profile };
    } else {
      this.profiles.push(profile);
    }

    this.currentUserId = profile.id;
    this.saveToStorage();

    try {
      await supabase.from('profiles').upsert({
        id: profile.id,
        full_name: profile.full_name,
        email: profile.email,
        phone: profile.phone,
        pan_number: profile.pan_number || '',
        aadhaar_number: profile.aadhaar_number || '',
        role: profile.role,
        kyc_status: profile.kyc_status,
        pipeline_stage: profile.pipeline_stage,
        ocr_confidence: profile.ocr_confidence,
        avatar_url: profile.avatar_url,
      });

      // Record password metadata relationship in user_password_metadata table
      await PasswordMetadataService.recordPasswordMetadata(profile.id, profile.email, password);
    } catch (e) {
      console.warn('Supabase profile & password metadata upsert sync error:', e);
    }

    return profile;
  }

  public sanitizeProfiles() {
    let modified = false;
    const seenIds = new Set<string>();

    this.profiles.forEach((p) => {
      const email = p.email?.toLowerCase() || '';

      // Rule 1: karthickeyan@gmail.com MUST have ID '00000000-0000-0000-0000-000000000001'
      if (email === 'karthickeyan@gmail.com' || email === 'karthic@samruddisave.com') {
        if (p.id !== '00000000-0000-0000-0000-000000000001') {
          const oldId = p.id;
          p.id = '00000000-0000-0000-0000-000000000001';
          modified = true;
          if (this.currentUserId === oldId) {
            this.currentUserId = p.id;
          }
        }
        p.full_name = 'karthickeyan M';
        p.email = 'karthickeyan@gmail.com';
        p.role = 'member';
      } else {
        // Rule 2: ALL OTHER CUSTOMERS (nehe, deva, etc.) MUST have unique v4 UUIDs
        if (p.id === '00000000-0000-0000-0000-000000000001' || p.id === 'user-member-1' || !this.isValidUUID(p.id) || seenIds.has(p.id)) {
          const oldId = p.id;
          p.id = this.generateUUID();
          modified = true;

          // If current logged-in user had the old duplicate ID, update currentUserId!
          if (this.currentUserId === oldId) {
            this.currentUserId = p.id;
          }

          // Asynchronously update Supabase database
          if (p.email) {
            supabase.from('profiles').update({ id: p.id }).eq('email', p.email);
          }
        }
      }
      seenIds.add(p.id);
    });

    if (modified) {
      this.saveToStorage();
    }
  }

  private normalizePipelineStage(stage?: string): string {
    if (!stage) return 'signup';
    const s = String(stage).toLowerCase();
    if (s.includes('signup')) return 'signup';
    if (s.includes('pending') || s.includes('due')) return 'pending';
    if (s.includes('approved')) return 'approved';
    if (s.includes('grace')) return 'grace';
    if (s.includes('hamper')) return 'hamper';
    if (s.includes('payout')) return 'payout';
    if (s.includes('matured')) return 'matured';
    return 'signup';
  }

  private deduplicateProfiles(list: UserProfile[]): UserProfile[] {
    const seen = new Set<string>();
    return list.filter((p) => {
      const key = p.email ? p.email.toLowerCase() : p.id;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }

  public async fetchLatestFromSupabase() {
    try {
      await this.pushAllProfilesToSupabase();
      const { data: dbProfiles, error: profileErr } = await supabase.from('profiles').select('*');
      if (!profileErr && dbProfiles && dbProfiles.length > 0) {
        dbProfiles.forEach((dbP: any) => {
          if (dbP.email?.toLowerCase() !== 'karthickeyan@gmail.com' && (dbP.id === '00000000-0000-0000-0000-000000000001' || dbP.id === 'user-member-1')) {
            dbP.id = this.generateUUID();
            supabase.from('profiles').update({ id: dbP.id }).eq('email', dbP.email);
          }

          const idx = this.profiles.findIndex((p) => p.email?.toLowerCase() === dbP.email?.toLowerCase() || p.id === dbP.id);
          const existingProfile = idx >= 0 ? this.profiles[idx] : null;
          const resolvedName = (dbP.full_name && dbP.full_name !== 'Member')
            ? dbP.full_name
            : (existingProfile?.full_name && existingProfile.full_name !== 'Member')
            ? existingProfile.full_name
            : 'Member';

          const mapped: UserProfile = {
            id: dbP.id,
            full_name: resolvedName,
            email: dbP.email || existingProfile?.email || '',
            phone: dbP.phone || existingProfile?.phone || '+91 98765 43210',
            pan_number: dbP.pan_number || existingProfile?.pan_number || 'ABCDE1234F',
            aadhaar_number: dbP.aadhaar_number || existingProfile?.aadhaar_number || '9876 5432 1098',
            role: dbP.role || existingProfile?.role || 'member',
            kyc_status: dbP.kyc_status || existingProfile?.kyc_status || 'pending',
            pipeline_stage: this.normalizePipelineStage(dbP.pipeline_stage || existingProfile?.pipeline_stage) as any,
            ocr_confidence: dbP.ocr_confidence || existingProfile?.ocr_confidence || 99.8,
            avatar_url: dbP.avatar_url || existingProfile?.avatar_url,
            created_at: dbP.created_at || existingProfile?.created_at || new Date().toISOString(),
          };
          if (idx >= 0) {
            this.profiles[idx] = { ...this.profiles[idx], ...mapped };
          } else {
            this.profiles.push(mapped);
          }
        });
        this.profiles = this.deduplicateProfiles(this.profiles);
        this.sanitizeProfiles();
        this.saveToStorage();
      }
    } catch (e) {
      console.warn('Supabase fetch fallback:', e);
    }
  }

  private async syncWithSupabase() {
    try {
      await this.pushAllProfilesToSupabase();
      await this.fetchLatestFromSupabase();
    } catch (e) {
      console.warn('Supabase initial fetch fallback:', e);
    }
  }

  private isValidUUID(uuidStr?: string): boolean {
    if (!uuidStr) return false;
    return /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(uuidStr);
  }

  private generateUUID(): string {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
      try {
        return crypto.randomUUID();
      } catch (e) {}
    }
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
      const r = (Math.random() * 16) | 0;
      const v = c === 'x' ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
  }

  public async pushAllProfilesToSupabase() {
    try {
      const emailUuidMap: Record<string, string> = {
        'karthickeyan@gmail.com': '00000000-0000-0000-0000-000000000001',
        'admin@samruddisave.com': '00000000-0000-0000-0000-000000000002',
        'sneha.roy@example.com': '00000000-0000-0000-0000-000000000003',
        'arjun.deshmukh@example.com': '00000000-0000-0000-0000-000000000004',
        'vikas.sharma@example.com': '00000000-0000-0000-0000-000000000005',
        'ananya.rao@example.com': '00000000-0000-0000-0000-000000000006',
        'rajesh.kumar@example.com': '00000000-0000-0000-0000-000000000007',
        'vikramaditya@example.com': '00000000-0000-0000-0000-000000000008',
        'meera.deshmukh@example.com': '00000000-0000-0000-0000-000000000009',
        'priya.patel@example.com': '00000000-0000-0000-0000-000000000010',
      };

      const dbRows = this.profiles.map((p) => {
        let validId = p.id;
        if (!this.isValidUUID(validId)) {
          validId = emailUuidMap[p.email?.toLowerCase()] || this.generateUUID();
          p.id = validId; // Ensure local profile has a valid unique UUID
        }
        return {
          id: validId,
          full_name: p.full_name,
          email: p.email,
          phone: p.phone || '+91 98765 43210',
          pan_number: p.pan_number || 'ABCDE1234F',
          aadhaar_number: p.aadhaar_number || '9876 5432 1098',
          role: p.role || 'member',
          kyc_status: p.kyc_status || 'approved',
          pipeline_stage: this.normalizePipelineStage((p as any).pipeline_stage),
          ocr_confidence: p.ocr_confidence || 99.8,
        };
      });

      const { error } = await supabase.from('profiles').upsert(dbRows, { onConflict: 'email' });
      if (!error) {
        console.log('Successfully synced all member profiles to Supabase DB!');
      } else {
        console.warn('Supabase profile upsert warning:', error.message);
      }
    } catch (e) {
      console.warn('Supabase auto-seed warning:', e);
    }
  }

  private loadFromStorage() {
    try {
      const storedProfiles = localStorage.getItem(STORAGE_KEYS.PROFILES);
      let loadedProfiles: UserProfile[] = storedProfiles ? JSON.parse(storedProfiles) : INITIAL_PROFILES;

      // Sanitize: If localStorage contains legacy invalid entries, clean up
      const isLegacy = loadedProfiles.some((p) => p.id === 'user-member-2' || (p.role !== 'member' && p.role !== 'admin'));
      if (isLegacy) {
        localStorage.clear();
        loadedProfiles = INITIAL_PROFILES;
      } else {
        // Merge missing seed profiles (e.g. pending KYC Sneha Roy) if not already present
        INITIAL_PROFILES.forEach((initP) => {
          if (!loadedProfiles.some((p) => p.id === initP.id || p.email === initP.email)) {
            loadedProfiles.push(initP);
          }
        });
      }

      // Ensure karthickeyan M profile is matched strictly by email and not overwriting new members
      loadedProfiles.forEach((p) => {
        if (p.email?.toLowerCase() === 'karthic@samruddisave.com' || p.email?.toLowerCase() === 'karthickeyan@gmail.com') {
          p.id = '00000000-0000-0000-0000-000000000001';
          p.role = 'member';
          p.full_name = 'karthickeyan M';
          p.email = 'karthickeyan@gmail.com';
        } else if (p.id === 'user-member-1' || p.id === '00000000-0000-0000-0000-000000000001') {
          p.id = this.generateUUID();
        }
      });

      // Ensure dedicated Admin profile exists
      let adminProfile = loadedProfiles.find((p) => p.role === 'admin' || p.email === 'admin@samruddisave.com');
      if (!adminProfile) {
        adminProfile = {
          id: 'user-admin-1',
          full_name: 'Operations Admin',
          email: 'admin@samruddisave.com',
          phone: '+91 98765 00000',
          pan_number: 'ADM000000A',
          aadhaar_number: '0000 0000 0000',
          role: 'admin',
          kyc_status: 'approved',
          pipeline_stage: 'ACTIVE_SAVING',
          ocr_confidence: 100,
          avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
          created_at: '2025-01-01T00:00:00Z',
        };
        loadedProfiles.push(adminProfile);
      } else {
        adminProfile.id = 'user-admin-1';
        adminProfile.role = 'admin';
        adminProfile.email = 'admin@samruddisave.com';
      }

      this.profiles = loadedProfiles;

      const storedMemberships = localStorage.getItem(STORAGE_KEYS.MEMBERSHIPS);
      this.memberships = storedMemberships && !isLegacy ? JSON.parse(storedMemberships) : INITIAL_MEMBERSHIPS;

      const storedContributions = localStorage.getItem(STORAGE_KEYS.CONTRIBUTIONS);
      this.contributions =   storedContributions && !isLegacy ? JSON.parse(storedContributions) : INITIAL_CONTRIBUTIONS;

      const storedPayouts = localStorage.getItem(STORAGE_KEYS.PAYOUTS);
      this.payouts = storedPayouts && !isLegacy ? JSON.parse(storedPayouts) : INITIAL_MATURITY_PAYOUTS;

      const storedTickets = localStorage.getItem(STORAGE_KEYS.TICKETS);
      this.tickets = storedTickets && !isLegacy ? JSON.parse(storedTickets) : INITIAL_TICKETS;

      const storedCircles = localStorage.getItem(STORAGE_KEYS.CIRCLES);
      this.circles = storedCircles && !isLegacy ? JSON.parse(storedCircles) : INITIAL_SAVINGS_CIRCLES;

      const storedLogs = localStorage.getItem(STORAGE_KEYS.AUDIT_LOGS);
      this.auditLogs = storedLogs && !isLegacy ? JSON.parse(storedLogs) : INITIAL_AUDIT_LOGS;

      const storedUserId = localStorage.getItem(STORAGE_KEYS.CURRENT_USER_ID);
      this.currentUserId = storedUserId || null;
      this.sanitizeProfiles();
    } catch (e) {
      console.error('Failed to parse state from localStorage, using initial mock data', e);
      this.profiles = INITIAL_PROFILES;
      this.memberships = INITIAL_MEMBERSHIPS;
      this.contributions = INITIAL_CONTRIBUTIONS;
      this.payouts = INITIAL_MATURITY_PAYOUTS;
      this.tickets = INITIAL_TICKETS;
      this.circles = INITIAL_SAVINGS_CIRCLES;
      this.auditLogs = INITIAL_AUDIT_LOGS;
      this.currentUserId = null;
      this.sanitizeProfiles();
    }
  }

  private saveToStorage() {
    try {
      localStorage.setItem(STORAGE_KEYS.PROFILES, JSON.stringify(this.profiles));
      localStorage.setItem(STORAGE_KEYS.MEMBERSHIPS, JSON.stringify(this.memberships));
      localStorage.setItem(STORAGE_KEYS.CONTRIBUTIONS, JSON.stringify(this.contributions));
      localStorage.setItem(STORAGE_KEYS.PAYOUTS, JSON.stringify(this.payouts));
      localStorage.setItem(STORAGE_KEYS.TICKETS, JSON.stringify(this.tickets));
      localStorage.setItem(STORAGE_KEYS.CIRCLES, JSON.stringify(this.circles));
      localStorage.setItem(STORAGE_KEYS.AUDIT_LOGS, JSON.stringify(this.auditLogs));
      if (this.currentUserId) {
        localStorage.setItem(STORAGE_KEYS.CURRENT_USER_ID, this.currentUserId);
      } else {
        localStorage.removeItem(STORAGE_KEYS.CURRENT_USER_ID);
      }
      localStorage.setItem(STORAGE_KEYS.ESCROW_BALANCE, this.escrowBalance.toString());
    } catch (e) {
      console.error('Failed to save state to localStorage', e);
    }
    this.notify();
  }

  public subscribe(listener: Listener): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify() {
    this.listeners.forEach((l) => l());
  }

  public checkGracePeriodAndPenalties() {
    const todayStr = new Date().toISOString().split('T')[0];
    this.memberships.forEach((m) => {
      if (m.next_due_date && m.next_due_date < todayStr && m.status === 'active') {
        const dueDate = new Date(m.next_due_date);
        const diffMs = Date.now() - dueDate.getTime();
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
        if (diffDays > 5) {
          m.grace_days_remaining = 0;
          m.status = 'defaulted';
          m.current_streak = 0; // Missed monthly payment beyond 5-day grace period resets streak
          const profile = this.profiles.find((p) => p.id === m.user_id);
          if (profile) {
            (profile as any).pipeline_stage = 'grace';
          }
        }
      }
    });
  }

  public getCurrentUser(): UserProfile {
    if (this.currentUserId) {
      // 1. Match by exact user ID
      let user = this.profiles.find((p) => p.id === this.currentUserId);
      if (user) return user;

      // 2. Match by email if currentUserId is an email or matches an existing profile's email
      user = this.profiles.find((p) => p.email && p.email.toLowerCase() === this.currentUserId?.toLowerCase());
      if (user) {
        user.id = this.currentUserId;
        return user;
      }

      // 3. Dynamic User Profile Provisioning (for newly registered or authenticated Supabase users)
      const isEmail = this.currentUserId.includes('@');
      const email = isEmail ? this.currentUserId : `user_${this.currentUserId.slice(-6)}@samruddisave.com`;
      const rawName = isEmail ? this.currentUserId.split('@')[0].replace(/[._]/g, ' ') : 'Member';
      const formattedName = rawName.charAt(0).toUpperCase() + rawName.slice(1);

      const provisionedUser: UserProfile = {
        id: this.currentUserId,
        full_name: formattedName,
        email: email,
        phone: '+91 98765 43210',
        pan_number: 'ABCDE1234F',
        aadhaar_number: '9876 5432 1098',
        role: 'member',
        kyc_status: 'approved',
        pipeline_stage: 'ACTIVE_SAVING',
        ocr_confidence: 99.8,
        avatar_url: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=300&q=80',
        created_at: new Date().toISOString(),
      };

      this.profiles.push(provisionedUser);
      this.saveToStorage();
      return provisionedUser;
    }

    return null;
  }

  public setCurrentUserId(userId: string | null) {
    this.currentUserId = userId;
    if (userId) {
      localStorage.setItem(STORAGE_KEYS.CURRENT_USER_ID, userId);
    } else {
      localStorage.removeItem(STORAGE_KEYS.CURRENT_USER_ID);
    }
    this.saveToStorage();
  }

  public async signOut(): Promise<void> {
    try {
      await supabase.auth.signOut();
    } catch (e) {
      console.warn('Supabase auth signout fallback:', e);
    }
    this.currentUserId = null;
    localStorage.removeItem(STORAGE_KEYS.CURRENT_USER_ID);
    this.saveToStorage();
  }

  public async createOnboardingProfile(data: { fullName: string; phone: string; panNumber: string }): Promise<{ success: boolean; profile?: UserProfile }> {
    const user = this.getCurrentUser();
    if (!user) return { success: false };

    user.full_name = data.fullName;
    user.phone = data.phone;
    user.pan_number = data.panNumber;
    user.kyc_status = 'pending';
    user.onboarding_completed = true;
    (user as any).pipeline_stage = 'pending';

    try {
      await supabase.from('profiles').upsert({
        id: user.id,
        full_name: data.fullName,
        email: user.email,
        phone: data.phone,
        pan_number: data.panNumber,
        kyc_status: 'pending',
        onboarding_completed: true,
        pipeline_stage: 'pending'
      });

      await supabase.from('kyc_records').insert({
        user_id: user.id,
        full_name: data.fullName,
        phone_number: data.phone,
        pan_number: data.panNumber,
        status: 'pending',
        terms_accepted: true
      });
    } catch (e) {
      console.warn('Supabase onboarding insert warning:', e);
    }

    this.saveToStorage();
    return { success: true, profile: user };
  }

  public getProfiles(): UserProfile[] {
    return [...this.profiles];
  }

  public getChitGroups(): ChitGroup[] {
    return [...this.chitGroups];
  }

  public getAuctions(): ChitAuction[] {
    return [...this.auctions];
  }

  public getBids(auctionId?: string): ChitBid[] {
    if (auctionId) {
      return this.bids.filter((b) => b.auction_id === auctionId);
    }
    return [...this.bids];
  }

  public async requestJoinChitGroup(groupId: string, userId: string) {
    const group = this.chitGroups.find((g) => g.id === groupId);
    if (!group) return { success: false, message: 'Group not found.' };

    const existing = this.chitGroupMembers.find((m) => m.group_id === groupId && m.user_id === userId);
    if (existing) return { success: true, message: 'Already requested or joined this group.' };

    const newMember: ChitGroupMember = {
      id: `cgm-${userId.slice(-4)}-${Date.now().toString().slice(-4)}`,
      group_id: groupId,
      user_id: userId,
      join_date: new Date().toISOString(),
      status: 'pending_approval'
    };

    this.chitGroupMembers.push(newMember);
    this.saveToStorage();

    try {
      await supabase.from('chit_group_members').insert({
        id: newMember.id,
        group_id: groupId,
        user_id: userId,
        status: newMember.status,
      });
    } catch (e) {
      console.warn('Supabase chit_group_members insert fallback:', e);
    }

    return { success: true, message: 'Join request submitted! Awaiting Admin Approval.' };
  }

  public async placeAuctionBid(auctionId: string, userId: string, discountAmount: number) {
    const auction = this.auctions.find((a) => a.id === auctionId);
    if (!auction) return { success: false, message: 'Auction not found.' };

    const user = this.profiles.find((p) => p.id === userId);
    const newBid: ChitBid = {
      id: `bid-${Date.now()}`,
      auction_id: auctionId,
      user_id: userId,
      user_name: user?.full_name || 'Member',
      bid_discount_amount: discountAmount,
      created_at: new Date().toISOString(),
    };

    this.bids.push(newBid);
    if (!auction.winning_discount_bid || discountAmount > auction.winning_discount_bid) {
      auction.winning_discount_bid = discountAmount;
      const g = this.chitGroups.find(group => group.id === auction.group_id);
      auction.prize_amount = (g?.total_value || 50000) - discountAmount;
    }
    this.saveToStorage();

    try {
      await supabase.from('bids').insert({
        id: newBid.id,
        auction_id: auctionId,
        user_id: userId,
        bid_discount_amount: discountAmount
      });
    } catch (e) {
      console.warn('Supabase bids insert fallback:', e);
    }

    return { success: true, message: 'Discount bid placed successfully!' };
  }

  public getMemberships(): Membership[] {
    return [...this.memberships];
  }

  public getUserMembership(userId: string): Membership {
    let m = this.memberships.find((m) => m.user_id === userId);
    if (!m) {
      const user = this.profiles.find((p) => p.id === userId);
      const isUnsubmitted = user?.kyc_status === 'unsubmitted' || user?.kyc_status === 'pending';
      m = {
        id: `m-${userId.slice(-6)}-${Date.now().toString().slice(-4)}`,
        user_id: userId,
        plan_id: 'plan-1000',
        monthly_amount: 1000,
        current_streak: 0,
        bonus_amount: 600,
        status: isUnsubmitted ? 'pending_first_payment' : 'active',
        due_day: 5,
        grace_days_remaining: 5,
        next_due_date: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        created_at: new Date().toISOString(),
      };
      this.memberships.push(m);
      this.saveToStorage();
    }
    return m;
  }

  public getUserContributions(userId: string): ContributionRecord[] {
    return this.contributions.filter((c) => c.user_id === userId);
  }

  public getContributions(): ContributionRecord[] {
    return [...this.contributions];
  }

  public getOfflineContributions(): ContributionRecord[] {
    return this.contributions.filter(
      (c) => c.is_offline || c.payment_method === 'offline_cash' || c.payment_method === 'offline_upi' || c.payment_method === 'bank_transfer'
    );
  }

  public getUserOfflineContributions(userId: string): ContributionRecord[] {
    return this.getOfflineContributions().filter((c) => c.user_id === userId);
  }

  public getPayouts(): MaturityPayout[] {
    if (this.payouts.length === 0) {
      this.payouts = [...INITIAL_MATURITY_PAYOUTS];
    }
    const completedMembers = this.profiles.filter((p) =>
      ['hamper', 'completed', 'matured', 'payout'].includes(((p as any).pipeline_stage || '').toLowerCase())
    );
    completedMembers.forEach((m) => {
      if (!this.payouts.some((po) => po.user_id === m.id)) {
        const hamper = GIFT_HAMPERS.find((h) => h.id === m.allocated_hamper_id) || GIFT_HAMPERS[0];
        this.payouts.push({
          id: `pay-${m.id.slice(-6)}`,
          user_id: m.id,
          user_name: m.full_name,
          user_email: m.email,
          membership_id: `m-${m.id.slice(-6)}`,
          principal_amount: 12000,
          bonus_amount: 600,
          total_disbursal_amount: 12600,
          maker_status: 'PENDING_MAKER',
          checker_status: 'PENDING_CHECKER',
          hamper_id: hamper.id,
          hamper_name: hamper.name,
          hamper_dispatch_status: 'PREPARING',
        });
      }
    });
    return this.payouts;
  }

  public getTickets(): SupportTicket[] {
    return this.tickets;
  }

  public getCircles(): SavingsCircle[] {
    return this.circles;
  }

  public getAuditLogs(): AuditLog[] {
    return this.auditLogs;
  }

  public getEscrowBalance(): number {
    return this.escrowBalance;
  }

  // --- Actions ---
  public setCurrentUser(userId: string) {
    this.currentUserId = userId;
    this.saveToStorage();
  }

  public async adminLogin(email: string, password: string): Promise<boolean> {
    if (!email || !password || !email.trim() || !password.trim()) {
      return false;
    }
    const q = email.toLowerCase().trim();

    // 1. Strict email match for registered admin profile
    let admin = this.profiles.find(
      (p) => p.email && p.email.toLowerCase() === q && p.role === 'admin'
    );

    // 2. Auto-provision default admin ONLY if email typed is admin@samruddisave.com
    if (!admin && (q === 'admin@samruddisave.com' || q === 'admin')) {
      admin = {
        id: 'user-admin-1',
        full_name: 'Operations Admin',
        email: 'admin@samruddisave.com',
        phone: '+91 98765 00000',
        pan_number: 'ADM000000A',
        aadhaar_number: '0000 0000 0000',
        role: 'admin',
        kyc_status: 'approved',
        pipeline_stage: 'ACTIVE_SAVING' as any,
        ocr_confidence: 100,
        avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
        created_at: '2025-01-01T00:00:00Z',
      };
      this.profiles.push(admin);
    }

    // If email typed is NOT an admin email, reject immediately!
    if (!admin) {
      return false;
    }

    // 3. Verify password strictly for this admin user
    const isValid = await PasswordMetadataService.verifyPassword(admin.id, admin.email, password);
    if (isValid) {
      this.currentUserId = admin.id;
      this.recordAuditLog({
        admin_id: admin.id,
        action: 'ADMIN_LOGIN',
        notes: `Admin ${admin.full_name} authenticated into Admin Console`,
        details: { email: admin.email, timestamp: new Date().toISOString() }
      });
      this.saveToStorage();
      return true;
    }

    return false;
  }

  public switchRole(role: UserRole) {
    const currentUser = this.getCurrentUser();
    // Only allow switching to admin if current user is already an admin
    if (role === 'admin' && currentUser?.role !== 'admin') {
      console.warn('Unauthorized role switch attempt blocked.');
      return;
    }
    const rep = this.profiles.find((p) => p.role === role);
    if (rep) {
      this.currentUserId = rep.id;
    }
    this.saveToStorage();
  }

  public processMonthlyDeposit(userId: string, amount: number) {
    const membership = this.getUserMembership(userId);
    if (membership) {
      this.recordPaymentWithMembership(
        membership.id,
        `PAY_SS_${Math.floor(10000000 + Math.random() * 90000000)}`,
        'razorpay',
        undefined,
        `Monthly deposit of ₹${amount}`
      );
    }
  }

  // Record Offline Payment with Backend API Synchronization
  public async recordOfflinePaymentBackend(payload: {
    userId: string;
    membershipId: string;
    amount: number;
    paymentMethod: 'offline_cash' | 'offline_upi' | 'bank_transfer';
    transactionRef?: string;
    notes?: string;
    adminId: string;
    adminName?: string;
  }): Promise<ContributionRecord | null> {
    const adminUser = this.profiles.find((p) => p.id === payload.adminId);
    const adminName = payload.adminName || adminUser?.full_name || 'Admin';

    // 1. Send POST request to backend Express REST API
    try {
      const response = await fetch('/api/payments/offline', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...payload,
          adminName,
        }),
      });

      if (!response.ok) {
        console.warn('Backend API returned non-OK response for offline payment, completing local state sync');
      } else {
        const data = await response.json();
        console.log('Backend Express API successfully recorded offline payment:', data);
      }
    } catch (e) {
      console.warn('Network call to backend /api/payments/offline failed, executing resilient local state update:', e);
    }

    // 2. Local State Sync for instant visual update
    return this.recordPaymentWithMembership(
      payload.membershipId,
      payload.transactionRef || `OFFLINE_${payload.paymentMethod === 'offline_cash' ? 'CASH' : 'UPI'}_${Date.now().toString().slice(-6)}`,
      payload.paymentMethod,
      payload.adminId,
      payload.notes || `Admin manually reconciled offline payment (${payload.paymentMethod.replace('_', ' ')})`,
      adminName
    );
  }

  // Task 2 & Task 7: Record Payment Linked to Membership ID (Online & Offline Manual Reconciliation)
  public recordPaymentWithMembership(
    membershipId: string,
    paymentRef: string,
    method: 'razorpay' | 'offline_cash' | 'offline_upi' | 'bank_transfer' = 'razorpay',
    adminId?: string,
    notes?: string,
    adminName?: string
  ): ContributionRecord | null {
    const membership = this.memberships.find((m) => m.id === membershipId);
    if (!membership) return null;

    const userContribs = this.contributions.filter((c) => c.membership_id === membershipId);
    const paidCount = userContribs.filter((c) => c.status === 'PAID').length;
    const nextCycle = Math.min(paidCount + 1, 12);
    const isOffline = method !== 'razorpay';

    const txRef = paymentRef || `${isOffline ? 'OFFLINE' : 'PAY_SS'}_${Math.floor(10000000 + Math.random() * 90000000)}`;
    const adminObj = adminId ? this.profiles.find((p) => p.id === adminId) : undefined;
    const adminNameResolved = adminName || adminObj?.full_name || (adminId ? 'Admin' : undefined);

    const newContrib: ContributionRecord = {
      id: `c-${membership.user_id.slice(-4)}-${nextCycle}-${Date.now().toString().slice(-4)}`,
      user_id: membership.user_id,
      membership_id: membership.id,
      amount: membership.monthly_amount,
      cycle_number: nextCycle,
      due_date: new Date().toISOString().split('T')[0],
      paid_date: new Date().toISOString(),
      status: 'PAID',
      transaction_ref: txRef,
      payment_method: method,
      is_offline: isOffline,
      reconciled_by_admin: adminId,
      reconciled_by_admin_name: adminNameResolved,
      admin_notes: notes || (isOffline ? `Admin manually reconciled ${method.replace('_', ' ')} deposit` : undefined),
      escrow_batch_id: `ESC_BATCH_${new Date().getFullYear()}${(new Date().getMonth() + 1).toString().padStart(2, '0')}`,
      created_at: new Date().toISOString(),
    };

    this.contributions.push(newContrib);
    membership.current_streak += 1;
    membership.status = 'active';
    membership.grace_days_remaining = 5;
    membership.next_due_date = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    this.escrowBalance += membership.monthly_amount;

    const profile = this.profiles.find((p) => p.id === membership.user_id);
    if (profile) {
      profile.pipeline_stage = 'ACTIVE_SAVING';
    }

    // Persist Contribution and Membership to Supabase Database
    try {
      supabase.from('contributions').insert({
        id: newContrib.id,
        user_id: newContrib.user_id,
        membership_id: newContrib.membership_id,
        amount: newContrib.amount,
        cycle_number: newContrib.cycle_number,
        due_date: newContrib.due_date,
        paid_date: newContrib.paid_date,
        status: newContrib.status,
        transaction_ref: newContrib.transaction_ref,
        payment_method: newContrib.payment_method,
        escrow_batch_id: newContrib.escrow_batch_id,
        created_at: newContrib.created_at,
      }).then(({ error }) => {
        if (error) console.warn('Supabase contributions insert warning:', error.message);
      });

      supabase.from('memberships').upsert({
        id: membership.id,
        user_id: membership.user_id,
        plan_id: membership.plan_id,
        monthly_amount: membership.monthly_amount,
        current_streak: membership.current_streak,
        bonus_amount: membership.bonus_amount,
        status: membership.status,
        due_day: membership.due_day,
        grace_days_remaining: membership.grace_days_remaining,
        next_due_date: membership.next_due_date,
      }).then(({ error }) => {
        if (error) console.warn('Supabase memberships upsert warning:', error.message);
      });
    } catch (dbErr) {
      console.warn('Supabase deposit persistence warning:', dbErr);
    }

    if (nextCycle === 12) {
      membership.status = 'matured';
      if (profile) profile.pipeline_stage = 'MATURED';

      const hamper = GIFT_HAMPERS.find((h) => h.id === profile?.allocated_hamper_id) || GIFT_HAMPERS[0];
      const newPayout: MaturityPayout = {
        id: `pay-${membership.user_id.slice(-4)}-12`,
        user_id: membership.user_id,
        user_name: profile?.full_name || 'Member',
        user_email: profile?.email || '',
        membership_id: membership.id,
        principal_amount: membership.monthly_amount * 12,
        bonus_amount: membership.bonus_amount,
        total_disbursal_amount: membership.monthly_amount * 12 + membership.bonus_amount,
        maker_status: 'PENDING_MAKER',
        checker_status: 'PENDING_CHECKER',
        hamper_id: hamper.id,
        hamper_name: hamper.name,
        hamper_dispatch_status: 'PREPARING',
      };
      this.payouts.push(newPayout);
    }

    // Task 7: Log audit trail if manual admin reconciliation
    if (adminId) {
      this.recordAuditLog({
        admin_id: adminId,
        member_id: membership.user_id,
        action: 'MANUAL_PAYMENT_RECONCILIATION',
        notes: notes || `Admin (${adminNameResolved}) manually reconciled offline payment (${method})`,
        details: {
          membership_id: membershipId,
          transaction_ref: txRef,
          cycle_number: nextCycle,
          amount: membership.monthly_amount,
          payment_method: method,
          admin_name: adminNameResolved
        }
      });
    } else {
      this.recordAuditLog({
        admin_id: 'system',
        member_id: membership.user_id,
        action: 'RAZORPAY_WEBHOOK_PAYMENT',
        notes: `Automated Razorpay order payment verified for membership ${membershipId}`,
        details: { membership_id: membershipId, transaction_ref: txRef, cycle_number: nextCycle }
      });
    }

    this.saveToStorage();
    return newContrib;
  }

  public async updateKYCStatus(userId: string, status: KYCStatus, adminId: string, notes?: string) {
    const profile = this.profiles.find((p) => p.id === userId);
    if (profile) {
      profile.kyc_status = status;
      if (status === 'approved') {
        profile.pipeline_stage = 'ACTIVE_SAVING';
      }

      try {
        await supabase.from('profiles').upsert({
          id: profile.id,
          full_name: profile.full_name,
          email: profile.email,
          phone: profile.phone,
          pan_number: profile.pan_number,
          aadhaar_number: profile.aadhaar_number,
          role: profile.role,
          kyc_status: status,
          pipeline_stage: this.normalizePipelineStage(profile.pipeline_stage),
        });
      } catch (e) {
        console.warn('Supabase profile update fallback:', e);
      }

      try {
        await fetch('/api/kyc/approve', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId, status, adminId }),
        });
      } catch (e) {
        console.warn('Backend /api/kyc/approve fallback:', e);
      }

      this.recordAuditLog({
        admin_id: adminId,
        member_id: userId,
        action: 'KYC_APPROVAL_UPDATE',
        notes: notes || `Admin updated KYC status to ${status}`,
        details: { user_id: userId, new_status: status }
      });
      this.saveToStorage();
    }
  }

  public async updateMemberPipelineStage(userId: string, newStage: string, adminId: string, notes?: string) {
    const profile = this.profiles.find((p) => p.id === userId);
    if (profile) {
      (profile as any).pipeline_stage = newStage;

      try {
        await supabase.from('profiles').update({ pipeline_stage: newStage }).eq('id', userId);
      } catch (e) {
        console.warn('Supabase pipeline stage update fallback:', e);
      }

      this.recordAuditLog({
        admin_id: adminId,
        member_id: userId,
        action: 'PIPELINE_STAGE_UPDATE',
        notes: notes || `Admin moved ${profile.full_name} to pipeline stage ${newStage}`,
        details: { user_id: userId, new_stage: newStage }
      });
      this.saveToStorage();
    }
  }

  public async submitKYCForApproval(userId: string, kycData: Partial<UserProfile>): Promise<UserProfile> {
    let profile: UserProfile | undefined = undefined;
    if (kycData.email) {
      profile = this.profiles.find((p) => p.email?.toLowerCase() === kycData.email?.toLowerCase());
    }
    if (!profile && userId && userId !== '00000000-0000-0000-0000-000000000001' && userId !== 'user-member-1') {
      const p = this.profiles.find((item) => item.id === userId);
      if (p && (!kycData.email || p.email?.toLowerCase() === kycData.email?.toLowerCase())) {
        profile = p;
      }
    }

    const now = new Date();
    const fourHoursLater = new Date(now.getTime() + 4 * 60 * 60 * 1000);

    if (profile) {
      profile.kyc_status = 'pending';
      (profile as any).pipeline_stage = 'pending';
      profile.submitted_at = now.toISOString();
      profile.auto_approval_due_at = fourHoursLater.toISOString();
      if (kycData.full_name && kycData.full_name !== 'Member') profile.full_name = kycData.full_name;
      if (kycData.email) profile.email = kycData.email;
      if (kycData.phone) profile.phone = kycData.phone;
      if (kycData.pan_number) profile.pan_number = kycData.pan_number;
      if (kycData.aadhaar_number) profile.aadhaar_number = kycData.aadhaar_number;
      if (kycData.ocr_confidence) profile.ocr_confidence = kycData.ocr_confidence;
      if (kycData.ocr_details) profile.ocr_details = kycData.ocr_details;
      if (kycData.bank_details) profile.bank_details = kycData.bank_details;
      if (kycData.avatar_url) profile.avatar_url = kycData.avatar_url;
    } else {
      const validId = kycData.id && this.isValidUUID(kycData.id) ? kycData.id : this.generateUUID();
      profile = {
        id: validId,
        full_name: kycData.full_name || 'Member',
        email: kycData.email || '',
        phone: kycData.phone || '',
        pan_number: kycData.pan_number || 'ABCDE1234F',
        aadhaar_number: kycData.aadhaar_number || '9876 5432 1098',
        role: 'member',
        kyc_status: 'pending',
        pipeline_stage: 'pending' as any,
        ocr_confidence: kycData.ocr_confidence || 99.8,
        avatar_url: kycData.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
        submitted_at: now.toISOString(),
        auto_approval_due_at: fourHoursLater.toISOString(),
        created_at: now.toISOString(),
      };
      this.profiles.push(profile);
      this.currentUserId = profile.id;
    }

    try {
      await supabase.from('profiles').upsert({
        id: profile.id,
        full_name: profile.full_name,
        email: profile.email,
        phone: profile.phone || '+91 98765 43210',
        pan_number: profile.pan_number || 'ABCDE1234F',
        aadhaar_number: profile.aadhaar_number || '9876 5432 1098',
        role: 'member',
        kyc_status: profile.kyc_status || 'pending',
        pipeline_stage: this.normalizePipelineStage((profile as any).pipeline_stage),
        ocr_confidence: profile.ocr_confidence || 99.8,
      }, { onConflict: 'email' });
    } catch (e) {
      console.warn('Supabase profile submit fallback:', e);
    }

    try {
      await fetch('/api/kyc/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: profile.id,
          fullName: profile.full_name,
          email: profile.email,
          phone: profile.phone,
          panNumber: profile.pan_number,
          aadhaarNumber: profile.aadhaar_number,
          ocrConfidence: profile.ocr_confidence,
          avatarUrl: profile.avatar_url,
          bankDetails: profile.bank_details,
        }),
      });
    } catch (e) {
      console.warn('Backend /api/kyc/submit fallback:', e);
    }

    this.recordAuditLog({
      admin_id: 'system',
      member_id: profile.id,
      action: 'KYC_SUBMITTED_12H_SLA',
      notes: `Member ${profile.full_name} submitted e-KYC OCR documents with 12-Hour SLA Auto-Verification Guarantee`,
      details: { user_id: profile.id, pan: profile.pan_number, auto_approval_due_at: profile.auto_approval_due_at }
    });

    this.saveToStorage();
    return profile;
  }

  // Fast-Forward 12-Hour SLA Auto-Approval (Triggers Auto Verification Without Admin Intervention)
  public async fastForward12HourAutoApproval(userId?: string) {
    try {
      await fetch('/api/kyc/fast-forward-auto-approve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      });
    } catch (e) {
      console.warn('Backend fast-forward fallback:', e);
    }

    let approvedCount = 0;
    this.profiles.forEach((p) => {
      if ((!userId || p.id === userId) && (p.kyc_status === 'pending' || (p as any).pipeline_stage === 'pending')) {
        p.kyc_status = 'approved';
        (p as any).pipeline_stage = 'ACTIVE_SAVING';
        approvedCount++;

        this.recordAuditLog({
          admin_id: 'SYSTEM_12H_SLA_WORKER',
          member_id: p.id,
          action: 'AUTO_KYC_VERIFIED_EXPIRED_12H',
          notes: `System auto-verified member ${p.full_name} account because Admin did not approve within 12-hour SLA window`,
          details: { user_id: p.id, sla_hours: 12, status: 'approved' }
        });
      }
    });

    this.saveToStorage();
    return approvedCount;
  }

  public allocateHamper(userId: string, hamperId: string, adminId: string) {
    const profile = this.profiles.find((p) => p.id === userId);
    const hamper = GIFT_HAMPERS.find((h) => h.id === hamperId);
    if (profile && hamper) {
      profile.allocated_hamper_id = hamperId;
      profile.allocated_by_admin = adminId;

      const payout = this.payouts.find((p) => p.user_id === userId);
      if (payout) {
        payout.hamper_id = hamperId;
        payout.hamper_name = hamper.name;
      }

      this.recordAuditLog({
        admin_id: adminId,
        member_id: userId,
        action: 'HAMPER_ALLOCATED',
        notes: `Admin allocated gift hamper "${hamper.name}" to ${profile.full_name}`,
        details: { hamper_id: hamperId, hamper_name: hamper.name }
      });
      this.saveToStorage();
    }
  }

  public recordAuditLog(logData: {
    admin_id: string;
    member_id?: string;
    action: string;
    notes?: string;
    details?: Record<string, any>;
  }) {
    const newLog: AuditLog = {
      id: `log-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      timestamp: new Date().toISOString(),
      admin_id: logData.admin_id,
      member_id: logData.member_id,
      action: logData.action,
      notes: logData.notes,
      details: logData.details || {},
      ip_address: '10.14.0.1'
    };
    this.auditLogs.unshift(newLog);
    this.saveToStorage();
  }

  public addAuditLog(action: string, notes?: string, details?: any) {
    this.recordAuditLog({
      admin_id: this.currentUserId,
      action,
      notes,
      details,
    });
  }

  public verifyMakerPayout(payoutId: string, adminId: string) {
    const payout = this.payouts.find((p) => p.id === payoutId);
    if (payout) {
      payout.maker_status = 'VERIFIED_BY_MAKER';
      payout.maker_verified_by = adminId;
      payout.maker_verified_at = new Date().toISOString();
      this.addAuditLog('MAKER_PAYOUT_VERIFIED', `Maker admin verified payout ${payoutId}`, { payoutId });
      this.saveToStorage();
    }
  }

  public disburseCheckerPayout(payoutId: string, adminId: string, txnRef: string) {
    const payout = this.payouts.find((p) => p.id === payoutId);
    if (payout) {
      payout.checker_status = 'DISBURSED';
      payout.checker_disbursed_by = adminId;
      payout.checker_disbursed_at = new Date().toISOString();
      payout.bank_transaction_ref = txnRef;
      this.addAuditLog('CHECKER_PAYOUT_DISBURSED', `Checker admin disbursed payout ${payoutId}`, { payoutId, txnRef });
      this.saveToStorage();
    }
  }

  public registerMember(profileData: Partial<UserProfile>): UserProfile {
    const validId = profileData.id && this.isValidUUID(profileData.id) ? profileData.id : this.generateUUID();
    const newProfile: UserProfile = {
      id: validId,
      full_name: profileData.full_name || 'Member',
      email: profileData.email || '',
      phone: profileData.phone || '',
      pan_number: profileData.pan_number || 'ABCDE1234F',
      aadhaar_number: profileData.aadhaar_number || '9876 5432 1098',
      role: 'member',
      kyc_status: 'pending',
      pipeline_stage: profileData.pipeline_stage || 'signup',
      ocr_confidence: profileData.ocr_confidence || 99.8,
      created_at: new Date().toISOString(),
    };

    this.profiles.push(newProfile);
    this.saveToStorage();

    // Async direct push to Supabase DB table
    supabase.from('profiles').upsert({
      id: newProfile.id,
      full_name: newProfile.full_name,
      email: newProfile.email,
      phone: newProfile.phone || '+91 98765 43210',
      pan_number: newProfile.pan_number || 'ABCDE1234F',
      aadhaar_number: newProfile.aadhaar_number || '9876 5432 1098',
      role: 'member',
      kyc_status: newProfile.kyc_status || 'pending',
      pipeline_stage: this.normalizePipelineStage(newProfile.pipeline_stage),
      ocr_confidence: newProfile.ocr_confidence || 99.8,
    }, { onConflict: 'email' }).then(({ error }) => {
      if (error) {
        console.warn('Supabase member signup error:', error.message);
      } else {
        console.log(`[SUPABASE REGISTER SUCCESS] Pushed member ${newProfile.full_name} (${newProfile.email}) to Supabase DB!`);
      }
    });

    return newProfile;
  }

  public createSupportTicket(
    ticketDataOrSubject: Partial<SupportTicket> | string,
    category?: any,
    initialMessage?: string
  ): SupportTicket {
    const user = this.getCurrentUser();
    let newTicket: SupportTicket;

    if (typeof ticketDataOrSubject === 'string') {
      newTicket = {
        id: `TICK-${Math.floor(1000 + Math.random() * 9000)}`,
        user_id: this.currentUserId,
        user_name: user.full_name,
        subject: ticketDataOrSubject,
        category: category || 'general',
        status: 'OPEN',
        priority: 'MEDIUM',
        messages: initialMessage
          ? [
              {
                id: `msg-${Date.now()}`,
                sender: user.full_name,
                sender_role: user.role,
                text: initialMessage,
                timestamp: new Date().toISOString(),
              },
            ]
          : [],
        created_at: new Date().toISOString(),
      };
    } else {
      newTicket = {
        id: `TICK-${Math.floor(1000 + Math.random() * 9000)}`,
        user_id: this.currentUserId,
        user_name: user.full_name,
        subject: ticketDataOrSubject.subject || 'Support Query',
        category: ticketDataOrSubject.category || 'general',
        status: 'OPEN',
        priority: ticketDataOrSubject.priority || 'MEDIUM',
        messages: ticketDataOrSubject.messages || [],
        created_at: new Date().toISOString(),
      };
    }

    this.tickets.unshift(newTicket);
    this.saveToStorage();
    return newTicket;
  }

  public replySupportTicket(
    ticketId: string,
    text: string,
    sender?: string,
    senderRole?: UserRole
  ) {
    const ticket = this.tickets.find((t) => t.id === ticketId);
    const user = this.getCurrentUser();
    if (ticket) {
      ticket.messages.push({
        id: `msg-${Date.now()}`,
        sender: sender || user.full_name,
        sender_role: senderRole || user.role,
        text,
        timestamp: new Date().toISOString(),
      });
      this.saveToStorage();
    }
  }

  public updateTicketStatus(ticketId: string, status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED') {
    const ticket = this.tickets.find((t) => t.id === ticketId);
    if (ticket) {
      ticket.status = status;
      this.saveToStorage();
    }
  }

  // Task 6: Export CSV Helper
  public exportLedgerCSV(): string {
    const headers = ['Contribution ID', 'Member ID', 'Membership ID', 'Amount (INR)', 'Cycle #', 'Due Date', 'Paid Date', 'Status', 'Txn Ref', 'Payment Method'];
    const rows = this.contributions.map((c) => [
      c.id,
      c.user_id,
      c.membership_id,
      c.amount,
      c.cycle_number,
      c.due_date,
      c.paid_date || 'N/A',
      c.status,
      c.transaction_ref,
      c.payment_method || 'razorpay'
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    return csvContent;
  }

  public downloadCSV(csvText: string, filename: string = 'samruddisave_ledger.csv') {
    const blob = new Blob([csvText], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  // Search Members by Member ID, Name, Phone, Email, or Login ID
  public searchMembers(query: string): UserProfile[] {
    if (!query || !query.trim()) return this.profiles.filter((p) => p.role === 'member');
    const q = query.toLowerCase().trim();
    return this.profiles.filter(
      (p) =>
        p.role === 'member' &&
        (p.id.toLowerCase().includes(q) ||
          p.full_name.toLowerCase().includes(q) ||
          p.email.toLowerCase().includes(q) ||
          p.phone.toLowerCase().includes(q) ||
          (p.login_id && p.login_id.toLowerCase().includes(q)))
    );
  }

  // Record Admin Cash / Offline Collection with complete validation & automatic ledger updates
  public recordAdminCashCollection(params: {
    memberId: string;
    amount: number;
    paymentDate: string;
    paymentType: 'cash' | 'upi' | 'bank_transfer';
    referenceNumber?: string;
    remarks?: string;
    adminId?: string;
  }): { success: boolean; message: string; record?: ContributionRecord } {
    const { memberId, amount, paymentDate, paymentType, referenceNumber, remarks, adminId } = params;

    const profile = this.profiles.find((p) => p.id === memberId);
    if (!profile) {
      return { success: false, message: 'Selected member does not exist in platform database.' };
    }

    if (amount <= 0) {
      return { success: false, message: 'Payment amount must be greater than zero.' };
    }

    const membership = this.getUserMembership(memberId);
    const plan = SAVINGS_PLANS.find((p) => p.id === membership?.plan_id) || SAVINGS_PLANS[0];
    const totalGoal = (membership?.monthly_amount || plan.monthly_amount) * 12;
    const paidContribs = this.getUserContributions(memberId).filter((c) => c.status === 'PAID');
    const currentPaidSum = paidContribs.reduce((acc, c) => acc + c.amount, 0);
    const remainingBalance = Math.max(0, totalGoal - currentPaidSum);

    if (amount > remainingBalance && remainingBalance > 0) {
      return {
        success: false,
        message: `Payment amount (₹${amount.toLocaleString()}) cannot exceed member remaining balance (₹${remainingBalance.toLocaleString()}).`,
      };
    }

    // Check duplicate reference number if provided
    if (referenceNumber && referenceNumber.trim()) {
      const isDuplicate = this.contributions.some(
        (c) => c.transaction_ref && c.transaction_ref.toLowerCase() === referenceNumber.trim().toLowerCase()
      );
      if (isDuplicate) {
        return {
          success: false,
          message: `Reference Number "${referenceNumber}" has already been submitted for a previous payment.`,
        };
      }
    }

    const paidCount = paidContribs.length;
    const nextCycle = Math.min(paidCount + 1, 12);
    const adminUser = this.profiles.find((p) => p.id === (adminId || this.currentUserId)) || this.getCurrentUser();

    const txRef = referenceNumber && referenceNumber.trim()
      ? referenceNumber.trim()
      : paymentType === 'cash'
      ? `CASH_REC_${Math.floor(100000 + Math.random() * 900000)}`
      : `UPI_REF_${Math.floor(100000 + Math.random() * 900000)}`;

    const receiptNum = `REC-2026-${Math.floor(10000 + Math.random() * 90000)}`;
    const newRemainingBalance = Math.max(0, remainingBalance - amount);

    const newContrib: ContributionRecord = {
      id: `c-${memberId.slice(-4)}-${nextCycle}-${Date.now().toString().slice(-4)}`,
      user_id: memberId,
      membership_id: membership?.id || `m-${memberId}`,
      amount,
      cycle_number: nextCycle,
      due_date: paymentDate || new Date().toISOString().split('T')[0],
      paid_date: new Date(paymentDate || Date.now()).toISOString(),
      status: 'PAID',
      transaction_ref: txRef,
      payment_method: paymentType === 'cash' ? 'offline_cash' : paymentType === 'upi' ? 'offline_upi' : 'bank_transfer',
      payment_type: paymentType,
      reconciled_by_admin: adminUser.id,
      reconciled_by_admin_name: adminUser.full_name,
      remarks: remarks || `Month ${nextCycle} Installment recorded by Admin`,
      admin_notes: remarks,
      reference_number: txRef,
      receipt_number: receiptNum,
      remaining_balance_after: newRemainingBalance,
      is_offline: true,
      escrow_batch_id: `ESC_BATCH_${new Date().getFullYear()}${(new Date().getMonth() + 1).toString().padStart(2, '0')}`,
      created_at: new Date().toISOString(),
    };

    this.contributions.push(newContrib);

    if (membership) {
      membership.current_streak += 1;
      membership.status = 'active';
      membership.grace_days_remaining = 5;
      membership.next_due_date = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    }

    profile.pipeline_stage = 'ACTIVE_SAVING';
    this.escrowBalance += amount;

    // Send automatic notification to member
    this.sendNotification({
      user_id: memberId,
      type: 'payment_success',
      title: 'Payment Confirmation Received',
      message: `₹${amount.toLocaleString()} cash/UPI deposit recorded for Installment #${nextCycle} (${receiptNum}).`,
    });

    this.recordAuditLog({
      admin_id: adminUser.id,
      member_id: memberId,
      action: 'ADMIN_CASH_COLLECTION',
      notes: `Admin ${adminUser.full_name} collected ₹${amount.toLocaleString()} (${paymentType.toUpperCase()}) for ${profile.full_name}`,
      details: {
        receipt_number: receiptNum,
        reference_number: txRef,
        amount,
        payment_type: paymentType,
        remarks: remarks || '',
      },
    });

    this.saveToStorage();
    return { success: true, message: `Payment of ₹${amount.toLocaleString()} successfully recorded for ${profile.full_name}!`, record: newContrib };
  }

  // Delete Contribution (Admin only)
  public deleteContribution(contribId: string, adminId: string): boolean {
    const idx = this.contributions.findIndex((c) => c.id === contribId);
    if (idx !== -1) {
      const contrib = this.contributions[idx];
      this.contributions.splice(idx, 1);
      this.recordAuditLog({
        admin_id: adminId,
        member_id: contrib.user_id,
        action: 'CONTRIBUTION_DELETED',
        notes: `Admin deleted contribution entry ${contribId} (₹${contrib.amount})`,
        details: { contribId, amount: contrib.amount, user_id: contrib.user_id },
      });
      this.saveToStorage();
      return true;
    }
    return false;
  }

  // Compute Member Ledger View with Opening, Installments, Credits, Debits, Remaining & Closing Balance
  public getMemberLedger(userId: string): MemberLedgerEntry[] {
    const contribs = this.getUserContributions(userId).filter((c) => c.status === 'PAID');
    const membership = this.getUserMembership(userId);
    const plan = SAVINGS_PLANS.find((p) => p.id === membership?.plan_id) || SAVINGS_PLANS[0];
    const monthlyAmount = membership?.monthly_amount || plan.monthly_amount;
    const totalGoal = monthlyAmount * 12;

    let currentBalance = 0;
    const ledger: MemberLedgerEntry[] = [];

    contribs.forEach((c, index) => {
      const opening = currentBalance;
      const credit = c.amount;
      const closing = opening + credit;
      currentBalance = closing;
      const remaining = Math.max(0, totalGoal - closing);

      ledger.push({
        id: `ledger-${c.id}`,
        membership_id: c.membership_id,
        user_id: c.user_id,
        date: c.paid_date ? new Date(c.paid_date).toLocaleDateString() : c.due_date,
        description: `Installment #${c.cycle_number} Deposit (${(c.payment_method || 'razorpay').replace(/_/g, ' ').toUpperCase()})`,
        opening_balance: opening,
        installment_amount: monthlyAmount,
        credit,
        debit: 0,
        remaining_balance: remaining,
        closing_balance: closing,
        payment_method: c.payment_method,
        receipt_ref: c.receipt_number || c.transaction_ref,
      });
    });

    return ledger;
  }

  // Notifications Storage & Methods
  private notifications: NotificationItem[] = [
    {
      id: 'notif-1',
      user_id: 'user-member-1',
      type: 'due_date',
      title: 'Upcoming Installment Due',
      message: 'Your Month 5 savings deposit of ₹10,000 is due in 3 days. Pay on time to maintain your 4-month streak!',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString(),
      read: false,
    },
    {
      id: 'notif-2',
      user_id: 'user-member-1',
      type: 'payment_success',
      title: 'Payment Receipt Verified',
      message: 'Escrow deposit of ₹10,000 for Month 4 verified by HDFC Escrow Trustee.',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
      read: true,
    },
  ];

  public getUserNotifications(userId: string): NotificationItem[] {
    return this.notifications.filter((n) => n.user_id === userId);
  }

  public sendNotification(data: { user_id: string; type: NotificationItem['type']; title: string; message: string }) {
    const newNotif: NotificationItem = {
      id: `notif-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      user_id: data.user_id,
      type: data.type,
      title: data.title,
      message: data.message,
      timestamp: new Date().toISOString(),
      read: false,
    };
    this.notifications.unshift(newNotif);
    this.notify();
  }

  public markNotificationAsRead(id: string) {
    const notif = this.notifications.find((n) => n.id === id);
    if (notif) {
      notif.read = true;
      this.notify();
    }
  }

  public markAllNotificationsAsRead(userId: string) {
    this.notifications.forEach((n) => {
      if (n.user_id === userId) n.read = true;
    });
    this.notify();
  }

  // Update Member User Profile
  public updateUserProfile(userId: string, data: Partial<UserProfile>) {
    const profile = this.profiles.find((p) => p.id === userId);
    if (profile) {
      Object.assign(profile, data);
      this.saveToStorage();
    }
  }

  public resetToDefaults() {
    localStorage.clear();
    this.loadFromStorage();
    this.saveToStorage();
  }
}

export const stateStore = new StateStore();
