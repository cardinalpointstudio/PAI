/**
 * Example contracts file for .workflow/contracts/
 *
 * Contracts define the interfaces between workers.
 * All workers import from contracts/ - this ensures type safety
 * across the parallel implementation.
 */

// =============================================================================
// Domain Types
// =============================================================================

export interface User {
  id: string;
  email: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateUserInput {
  email: string;
  name: string;
  password: string;
}

export interface UpdateUserInput {
  name?: string;
  email?: string;
}

// =============================================================================
// API Contracts
// =============================================================================

/**
 * Backend worker must implement this service interface
 */
export interface UserService {
  create(input: CreateUserInput): Promise<User>;
  getById(id: string): Promise<User | null>;
  update(id: string, input: UpdateUserInput): Promise<User>;
  delete(id: string): Promise<void>;
  list(options?: { limit?: number; offset?: number }): Promise<User[]>;
}

/**
 * API route contracts - defines request/response shapes
 */
export interface ApiRoutes {
  // POST /api/users
  createUser: {
    request: CreateUserInput;
    response: { user: User };
  };

  // GET /api/users/:id
  getUser: {
    params: { id: string };
    response: { user: User };
  };

  // PATCH /api/users/:id
  updateUser: {
    params: { id: string };
    request: UpdateUserInput;
    response: { user: User };
  };

  // DELETE /api/users/:id
  deleteUser: {
    params: { id: string };
    response: { success: boolean };
  };
}

// =============================================================================
// Frontend Contracts
// =============================================================================

/**
 * Frontend worker uses these for component props
 */
export interface UserFormProps {
  initialData?: Partial<CreateUserInput>;
  onSubmit: (data: CreateUserInput) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

export interface UserListProps {
  users: User[];
  onSelect: (user: User) => void;
  onDelete: (id: string) => void;
  isLoading?: boolean;
}

/**
 * Frontend state shape
 */
export interface UserState {
  users: User[];
  currentUser: User | null;
  isLoading: boolean;
  error: string | null;
}

// =============================================================================
// Error Types (shared)
// =============================================================================

export class ApiError extends Error {
  constructor(
    message: string,
    public statusCode: number,
    public code: string
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export const ErrorCodes = {
  NOT_FOUND: "NOT_FOUND",
  VALIDATION_ERROR: "VALIDATION_ERROR",
  UNAUTHORIZED: "UNAUTHORIZED",
  FORBIDDEN: "FORBIDDEN",
  INTERNAL_ERROR: "INTERNAL_ERROR",
} as const;

export type ErrorCode = (typeof ErrorCodes)[keyof typeof ErrorCodes];
