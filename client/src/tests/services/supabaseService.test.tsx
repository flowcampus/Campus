import { SupabaseService } from '../../services/supabaseService';
import { supabase } from '../../lib/supabase';

// Mock Supabase
jest.mock('../../lib/supabase', () => ({
  supabase: {
    auth: {
      signUp: jest.fn(),
      signInWithPassword: jest.fn(),
      signOut: jest.fn(),
      getUser: jest.fn(),
      getSession: jest.fn(),
      onAuthStateChange: jest.fn(() => ({ data: { subscription: { unsubscribe: jest.fn() } } })),
    },
    from: jest.fn(() => ({
      select: jest.fn().mockReturnThis(),
      insert: jest.fn().mockReturnThis(),
      update: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn(),
      order: jest.fn().mockReturnThis(),
    })),
  },
  handleSupabaseError: jest.fn((error) => error.message || 'Unknown error'),
}));

describe('SupabaseService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Authentication', () => {
    test('signUp should create new user', async () => {
      const mockResponse = { data: { user: { id: '1' } }, error: null };
      (supabase.auth.signUp as jest.Mock).mockResolvedValue(mockResponse);

      const result = await SupabaseService.signUp('test@example.com', 'password123', {});
      
      expect(supabase.auth.signUp).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123',
        options: { data: {} }
      });
      expect(result.error).toBeNull();
    });

    test('signIn should authenticate user', async () => {
      const mockResponse = { data: { user: { id: '1' } }, error: null };
      (supabase.auth.signInWithPassword as jest.Mock).mockResolvedValue(mockResponse);

      const result = await SupabaseService.signIn('test@example.com', 'password123');
      
      expect(supabase.auth.signInWithPassword).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123'
      });
      expect(result.error).toBeNull();
    });

    test('signOut should clear session', async () => {
      const mockResponse = { error: null };
      (supabase.auth.signOut as jest.Mock).mockResolvedValue(mockResponse);

      const result = await SupabaseService.signOut();
      
      expect(supabase.auth.signOut).toHaveBeenCalled();
      expect(result.error).toBeNull();
    });
  });

  describe('Profile Management', () => {
    test('getProfile should fetch user profile', async () => {
      const mockProfile = { id: '1', first_name: 'John', last_name: 'Doe' };
      const mockQuery = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({ data: mockProfile, error: null }),
      };
      (supabase.from as jest.Mock).mockReturnValue(mockQuery);

      const result = await SupabaseService.getProfile('1');
      
      expect(supabase.from).toHaveBeenCalledWith('profiles');
      expect(result.data).toEqual(mockProfile);
      expect(result.error).toBeNull();
    });
  });
});