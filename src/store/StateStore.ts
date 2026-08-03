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
  GiftHamper
} from '../types';
import {
  INITIAL_PROFILES,
  INITIAL_MEMBERSHIPS,
  INITIAL_CONTRIBUTIONS,
  INITIAL_MATURITY_PAYOUTS,
  INITIAL_TICKETS,
  INITIAL_SAVINGS_CIRCLES,
  INITIAL_AUDIT_LOGS,
  SAVINGS_PLANS,
  GIFT_HAMPERS
} from '../data/mockData';

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
  private escrowBalance: number = 4850000;
  private currentUserId: string = 'user-member-1';

  constructor() {
    this.loadFromStorage();
  }

  private loadFromStorage() {
    try {
      const storedProfiles = localStorage.getItem(STORAGE_KEYS.PROFILES);
      this.profiles = storedProfiles ? JSON.parse(storedProfiles) : INITIAL_PROFILES;

      const storedMemberships = localStorage.getItem(STORAGE_KEYS.MEMBERSHIPS);
      this.memberships = storedMemberships ? JSON.parse(storedMemberships) : INITIAL_MEMBERSHIPS;

      const storedContributions = localStorage.getItem(STORAGE_KEYS.CONTRIBUTIONS);
      this.contributions = storedContributions ? JSON.parse(storedContributions) : INITIAL_CONTRIBUTIONS;

      const storedPayouts = localStorage.getItem(STORAGE_KEYS.PAYOUTS);
      this.payouts = storedPayouts ? JSON.parse(storedPayouts) : INITIAL_MATURITY_PAYOUTS;

      const storedTickets = localStorage.getItem(STORAGE_KEYS.TICKETS);
      this.tickets = storedTickets ? JSON.parse(storedTickets) : INITIAL_TICKETS;

      const storedCircles = localStorage.getItem(STORAGE_KEYS.CIRCLES);
      this.circles = storedCircles ? JSON.parse(storedCircles) : INITIAL_SAVINGS_CIRCLES;

      const storedLogs = localStorage.getItem(STORAGE_KEYS.AUDIT_LOGS);
      this.auditLogs = storedLogs ? JSON.parse(storedLogs) : INITIAL_AUDIT_LOGS;

      const storedUserId = localStorage.getItem(STORAGE_KEYS.CURRENT_USER_ID);
      this.currentUserId = storedUserId || 'user-member-1';
    } catch (e) {
      console.error('Failed to parse state from localStorage, using initial mock data', e);
      this.profiles = INITIAL_PROFILES;
      this.memberships = INITIAL_MEMBERSHIPS;
      this.contributions = INITIAL_CONTRIBUTIONS;
      this.payouts = INITIAL_MATURITY_PAYOUTS;
      this.tickets = INITIAL_TICKETS;
      this.circles = INITIAL_SAVINGS_CIRCLES;
      this.auditLogs = INITIAL_AUDIT_LOGS;
      this.currentUserId = 'user-member-1';
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
      localStorage.setItem(STORAGE_KEYS.CURRENT_USER_ID, this.currentUserId);
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

  // --- Getters ---
  public getCurrentUser(): UserProfile {
    const user = this.profiles.find((p) => p.id === this.currentUserId);
    if (user) return user;
    return this.profiles[0] || INITIAL_PROFILES[0];
  }

  public getProfiles(): UserProfile[] {
    return this.profiles;
  }

  public getMemberships(): Membership[] {
    return this.memberships;
  }

  public getUserMembership(userId: string): Membership | undefined {
    return this.memberships.find((m) => m.user_id === userId);
  }

  public getUserContributions(userId: string): ContributionRecord[] {
    return this.contributions.filter((c) => c.user_id === userId);
  }

  public getPayouts(): MaturityPayout[] {
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
    this.addAuditLog('PERSONA_SWITCH', `Switched active session to user ID ${userId}`);
    this.saveToStorage();
  }

  public switchRole(role: UserRole) {
    // Find representative user for this role
    const rep = this.profiles.find((p) => p.role === role);
    if (rep) {
      this.currentUserId = rep.id;
    }
    this.addAuditLog('ROLE_SWITCH', `Switched active RBAC role to ${role}`);
    this.saveToStorage();
  }

  public registerMember(data: {
    full_name: string;
    email: string;
    phone: string;
    pan_number: string;
    aadhaar_number: string;
    ocr_confidence?: number;
    ocr_details?: UserProfile['ocr_details'];
    bank_details?: UserProfile['bank_details'];
  }): UserProfile {
    const newId = `user-member-${Date.now().toString().slice(-4)}`;
    const newProfile: UserProfile = {
      id: newId,
      full_name: data.full_name,
      email: data.email,
      phone: data.phone,
      pan_number: data.pan_number.toUpperCase(),
      aadhaar_number: data.aadhaar_number,
      role: 'member',
      kyc_status: 'pending',
      pipeline_stage: 'KYC_PENDING',
      ocr_confidence: data.ocr_confidence || 99.8,
      ocr_details: data.ocr_details || {
        pan_name_match: true,
        photo_match_pct: 99.8,
        extracted_pan: data.pan_number.toUpperCase(),
        extracted_aadhaar: data.aadhaar_number,
        document_type: 'PAN & Aadhaar OCR Verification',
      },
      bank_details: data.bank_details,
      created_at: new Date().toISOString(),
    };

    this.profiles.unshift(newProfile);
    this.currentUserId = newId;
    this.addAuditLog('KYC_SUBMITTED', `New member registration for ${data.full_name} (${data.email})`);
    this.saveToStorage();
    return newProfile;
  }

  public updateKYCStatus(userId: string, status: KYCStatus, officerName: string) {
    const profile = this.profiles.find((p) => p.id === userId);
    if (profile) {
      profile.kyc_status = status;
      if (status === 'approved') {
        profile.pipeline_stage = 'PAYMENT_ACTIVE';
      }
      this.addAuditLog('KYC_UPDATE', `Officer ${officerName} updated KYC status for ${profile.full_name} to ${status}`);
      this.saveToStorage();
    }
  }

  public selectPlanAndCreateMembership(
    userId: string,
    planId: string,
    bankDetails: NonNullable<UserProfile['bank_details']>
  ) {
    const profile = this.profiles.find((p) => p.id === userId);
    if (profile) {
      profile.bank_details = bankDetails;
    }

    const plan = SAVINGS_PLANS.find((p) => p.id === planId) || SAVINGS_PLANS[0];
    const membershipId = `m-${userId.slice(-6)}-${Date.now().toString().slice(-4)}`;

    const newMembership: Membership = {
      id: membershipId,
      user_id: userId,
      plan_id: plan.id,
      monthly_amount: plan.monthly_amount,
      current_streak: 1,
      bonus_amount: plan.bonus_amount,
      status: 'active',
      due_day: 5,
      grace_days_remaining: 5,
      next_due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      created_at: new Date().toISOString(),
    };

    // Remove existing membership for this user if any
    this.memberships = this.memberships.filter((m) => m.user_id !== userId);
    this.memberships.push(newMembership);

    // Create Cycle 1 deposit record
    const cycle1Ref = `PAY_SS_${Math.floor(10000000 + Math.random() * 90000000)}`;
    const newContrib: ContributionRecord = {
      id: `c-${userId.slice(-4)}-1`,
      user_id: userId,
      membership_id: membershipId,
      amount: plan.monthly_amount,
      cycle_number: 1,
      due_date: new Date().toISOString().split('T')[0],
      paid_date: new Date().toISOString(),
      status: 'PAID',
      transaction_ref: cycle1Ref,
      escrow_batch_id: `ESC_BATCH_${new Date().getFullYear()}${(new Date().getMonth() + 1).toString().padStart(2, '0')}`,
    };

    this.contributions.push(newContrib);
    this.escrowBalance += plan.monthly_amount;

    this.addAuditLog(
      'PLAN_ACTIVATED',
      `Member activated ${plan.name} (₹${plan.monthly_amount}/mo). Month 1 contribution logged with ref ${cycle1Ref}`
    );

    this.saveToStorage();
  }

  public processMonthlyDeposit(userId: string, amount: number) {
    const membership = this.memberships.find((m) => m.user_id === userId);
    if (!membership) return;

    const userContribs = this.contributions.filter((c) => c.user_id === userId);
    const paidCount = userContribs.filter((c) => c.status === 'PAID').length;
    const nextCycle = paidCount + 1;

    if (nextCycle <= 12) {
      const txRef = `PAY_SS_${Math.floor(10000000 + Math.random() * 90000000)}`;
      const newContrib: ContributionRecord = {
        id: `c-${userId.slice(-4)}-${nextCycle}`,
        user_id: userId,
        membership_id: membership.id,
        amount: amount,
        cycle_number: nextCycle,
        due_date: new Date().toISOString().split('T')[0],
        paid_date: new Date().toISOString(),
        status: 'PAID',
        transaction_ref: txRef,
        escrow_batch_id: `ESC_BATCH_${new Date().getFullYear()}${(new Date().getMonth() + 1).toString().padStart(2, '0')}`,
      };

      this.contributions.push(newContrib);
      membership.current_streak += 1;
      membership.status = 'active';
      membership.grace_days_remaining = 5;
      this.escrowBalance += amount;

      if (nextCycle === 12) {
        membership.status = 'matured';
        const profile = this.profiles.find((p) => p.id === userId);
        if (profile) profile.pipeline_stage = 'MATURITY_REACHED';

        // Create maturity payout record
        const hamper = GIFT_HAMPERS.find((h) => h.id === profile?.allocated_hamper_id) || GIFT_HAMPERS[0];
        const newPayout: MaturityPayout = {
          id: `pay-${userId.slice(-4)}-12`,
          user_id: userId,
          user_name: profile?.full_name || 'Member',
          user_email: profile?.email || '',
          membership_id: membership.id,
          principal_amount: amount * 12,
          bonus_amount: membership.bonus_amount,
          total_disbursal_amount: amount * 12 + membership.bonus_amount,
          maker_status: 'PENDING_MAKER',
          checker_status: 'PENDING_CHECKER',
          hamper_id: hamper.id,
          hamper_name: hamper.name,
          hamper_dispatch_status: 'PREPARING',
        };
        this.payouts.push(newPayout);
      }

      this.addAuditLog(
        'PAYMENT_SUCCESS',
        `Processed Month ${nextCycle} deposit of ₹${amount} for member. Streak updated to ${membership.current_streak}`
      );
      this.saveToStorage();
    }
  }

  public allocateHamper(userId: string, hamperId: string, adminName: string) {
    const profile = this.profiles.find((p) => p.id === userId);
    const hamper = GIFT_HAMPERS.find((h) => h.id === hamperId);
    if (profile && hamper) {
      profile.allocated_hamper_id = hamperId;
      profile.allocated_by_admin = adminName;

      // Update payout record if exists
      const payout = this.payouts.find((p) => p.user_id === userId);
      if (payout) {
        payout.hamper_id = hamperId;
        payout.hamper_name = hamper.name;
      }

      this.addAuditLog(
        'HAMPER_ALLOCATED',
        `${adminName} allocated gift hamper "${hamper.name}" to ${profile.full_name}`
      );
      this.saveToStorage();
    }
  }

  public verifyMakerPayout(payoutId: string, officerName: string) {
    const payout = this.payouts.find((p) => p.id === payoutId);
    if (payout) {
      payout.maker_status = 'VERIFIED_BY_MAKER';
      payout.maker_verified_by = officerName;
      payout.maker_verified_at = new Date().toISOString();

      this.addAuditLog(
        'MAKER_VERIFIED',
        `MRM Officer ${officerName} verified MAKER-step for ${payout.user_name} (Amount: ₹${payout.total_disbursal_amount})`
      );
      this.saveToStorage();
    }
  }

  public disburseCheckerPayout(payoutId: string, bankRef: string, adminName: string) {
    const payout = this.payouts.find((p) => p.id === payoutId);
    if (payout) {
      payout.checker_status = 'DISBURSED';
      payout.checker_disbursed_by = adminName;
      payout.checker_disbursed_at = new Date().toISOString();
      payout.bank_transaction_ref = bankRef;
      payout.hamper_dispatch_status = 'DISPATCHED';

      const membership = this.memberships.find((m) => m.id === payout.membership_id);
      if (membership) membership.status = 'disbursed';

      const profile = this.profiles.find((p) => p.id === payout.user_id);
      if (profile) profile.pipeline_stage = 'DISBURSED';

      this.escrowBalance -= payout.total_disbursal_amount;

      this.addAuditLog(
        'CHECKER_DISBURSED',
        `Finance Admin ${adminName} executed CHECKER final disbursal for ${payout.user_name}. Bank Ref: ${bankRef}. Escrow disbursed: ₹${payout.total_disbursal_amount}`
      );
      this.saveToStorage();
    }
  }

  public createSupportTicket(subject: string, category: SupportTicket['category'], initialMessage: string) {
    const user = this.getCurrentUser();
    const newTicket: SupportTicket = {
      id: `TICK-${Math.floor(1000 + Math.random() * 9000)}`,
      user_id: user.id,
      user_name: user.full_name,
      subject,
      category,
      status: 'OPEN',
      priority: 'MEDIUM',
      messages: [
        {
          id: `msg-${Date.now()}`,
          sender: user.full_name,
          sender_role: user.role,
          text: initialMessage,
          timestamp: new Date().toISOString(),
        },
      ],
      created_at: new Date().toISOString(),
    };

    this.tickets.unshift(newTicket);
    this.addAuditLog('TICKET_CREATED', `Support ticket ${newTicket.id} opened by ${user.full_name}`);
    this.saveToStorage();
  }

  public replySupportTicket(ticketId: string, text: string) {
    const ticket = this.tickets.find((t) => t.id === ticketId);
    const user = this.getCurrentUser();
    if (ticket) {
      ticket.messages.push({
        id: `msg-${Date.now()}`,
        sender: user.full_name,
        sender_role: user.role,
        text,
        timestamp: new Date().toISOString(),
      });

      if (user.role === 'support_agent' || user.role === 'employee' || user.role === 'super_admin') {
        ticket.status = 'IN_PROGRESS';
      }
      this.saveToStorage();
    }
  }

  public updateTicketStatus(ticketId: string, status: SupportTicket['status']) {
    const ticket = this.tickets.find((t) => t.id === ticketId);
    if (ticket) {
      ticket.status = status;
      this.saveToStorage();
    }
  }

  public addAuditLog(action: string, details: string) {
    const user = this.getCurrentUser();
    const newLog: AuditLog = {
      id: `log-${Date.now()}`,
      timestamp: new Date().toISOString(),
      user_id: user.id,
      user_role: user.role,
      action,
      details,
      ip_address: '10.14.0.1',
    };
    this.auditLogs.unshift(newLog);
  }

  public resetToDefaults() {
    localStorage.clear();
    this.loadFromStorage();
    this.saveToStorage();
  }
}

export const stateStore = new StateStore();
