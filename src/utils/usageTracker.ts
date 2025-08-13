import { supabase } from '../supabaseClient';
import { v4 as uuidv4 } from 'uuid';

export interface UsageData {
  count: number;
  date: string;
  isAnonymous: boolean;
}

export class UsageTracker {
  private static readonly ANON_ID_KEY = 'mystical_ai_anonymous_id';
  private static readonly GUEST_DAY_KEY = 'guest_day';
  private static readonly GUEST_USED_KEY = 'guest_used';

  // лимиты для гостей; для залогиненных берём из profiles.daily_limit
  private static readonly ANONYMOUS_DAILY_LIMIT = 5;

  private static getAnonymousId(): string {
    let id = localStorage.getItem(this.ANON_ID_KEY);
    if (!id) {
      id = uuidv4();
      localStorage.setItem(this.ANON_ID_KEY, id);
    }
    return id;
  }
  private static clearAnonymousId() {
    localStorage.removeItem(this.ANON_ID_KEY);
  }

  // ----- helpers for guest -----
  private static initGuestDay() {
    const today = new Date().toISOString().slice(0, 10);
    if (localStorage.getItem(this.GUEST_DAY_KEY) !== today) {
      localStorage.setItem(this.GUEST_DAY_KEY, today);
      localStorage.setItem(this.GUEST_USED_KEY, '0');
    }
  }
  private static getGuestUsed(): number {
    this.initGuestDay();
    return parseInt(localStorage.getItem(this.GUEST_USED_KEY) || '0', 10);
  }
  private static incGuestUsed() {
    this.initGuestDay();
    const used = this.getGuestUsed() + 1;
    localStorage.setItem(this.GUEST_USED_KEY, String(used));
  }

  // ----- public API -----

  // Текущее использование (без списания)
  static async getTodayUsage(userId?: string): Promise<UsageData> {
    const today = new Date().toISOString().slice(0, 10);

    // Гость
    if (!userId) {
      return { count: this.getGuestUsed(), date: today, isAnonymous: true };
    }

    // Пользователь: нормализуем профиль и читаем used_today
    await supabase.rpc('normalize_profile_for_today', { p_user_id: userId });

    const { data, error } = await supabase
      .from('profiles')
      .select('used_today')
      .eq('user_id', userId)
      .single();

    if (error) {
      console.warn('[usage] getTodayUsage error:', error);
      return { count: 0, date: today, isAnonymous: false };
    }

    return {
      count: data?.used_today ?? 0,
      date: today,
      isAnonymous: false,
    };
  }

  // Можно ли отправить запрос (без списания)
  static async canMakeRequest(userId?: string): Promise<boolean> {
    // Гость
    if (!userId) {
      return this.getGuestUsed() < this.ANONYMOUS_DAILY_LIMIT;
    }

    await supabase.rpc('normalize_profile_for_today', { p_user_id: userId });
    const { data, error } = await supabase
      .from('profiles')
      .select('daily_limit, used_today')
      .eq('user_id', userId)
      .single();

    if (error || !data) return false;
    return (data.used_today ?? 0) < (data.daily_limit ?? 0);
  }

  // Сколько осталось (без списания)
  static async getRemainingRequests(userId?: string): Promise<number> {
    if (!userId) {
      return Math.max(0, this.ANONYMOUS_DAILY_LIMIT - this.getGuestUsed());
    }

    await supabase.rpc('normalize_profile_for_today', { p_user_id: userId });
    const { data, error } = await supabase
      .from('profiles')
      .select('daily_limit, used_today')
      .eq('user_id', userId)
      .single();

    if (error || !data) return 0;
    return Math.max(0, (data.daily_limit ?? 0) - (data.used_today ?? 0));
  }

  // Списание использования (атомарно)
  static async incrementUsage(userId?: string): Promise<void> {
    // Гость
    if (!userId) {
      if (await this.canMakeRequest(undefined)) this.incGuestUsed();
      return;
    }
    // Пользователь: атомарно списываем 1 через RPC
    await supabase.rpc('debit_one');
  }

  // Удобный метод: "проверить и списать" одной операцией
  static async checkAndDebit(userId?: string): Promise<boolean> {
    if (!userId) {
      const can = await this.canMakeRequest(undefined);
      if (can) this.incGuestUsed();
      return can;
    }
    const { data, error } = await supabase.rpc('debit_one');
    if (error) {
      console.warn('[usage] debit_one error:', error);
      return false;
    }
    return !!data;
  }

  // При входе в аккаунт «сливаем» гостевой счётчик: просто чистим локалсторадж
  static async migrateAnonymousUsage(_userId: string): Promise<void> {
    this.clearAnonymousId();
    localStorage.removeItem(this.GUEST_USED_KEY);
    localStorage.removeItem(this.GUEST_DAY_KEY);
  }
}