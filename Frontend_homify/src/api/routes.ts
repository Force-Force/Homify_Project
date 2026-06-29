export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8000/api';

export const API_ROUTES = {
  auth: {
    register: `${API_BASE_URL}/auth/register/`,
    login: `${API_BASE_URL}/auth/login/`,
    refresh: `${API_BASE_URL}/auth/refresh/`,
    logout: `${API_BASE_URL}/auth/logout/`,
    me: `${API_BASE_URL}/auth/me/`,
    changePassword: `${API_BASE_URL}/auth/me/password/`,
    forgotPassword: `${API_BASE_URL}/auth/forgot-password/`,
    resetPassword: `${API_BASE_URL}/auth/reset-password/`,
    verifyEmail: `${API_BASE_URL}/auth/verify-email/`,
    resendVerification: `${API_BASE_URL}/auth/resend-verification/`,
    deleteAccount: `${API_BASE_URL}/auth/me/delete/`,
    social: `${API_BASE_URL}/auth/social/`,
  },
  properties: {
    list: `${API_BASE_URL}/properties/`,
    details: (id: number | string) => `${API_BASE_URL}/properties/${id}/`,
    myProperties: `${API_BASE_URL}/properties/my_properties/`,
    uploadPhotos: (id: number | string) => `${API_BASE_URL}/properties/${id}/upload_photos/`,
    deletePhoto: (id: number | string, photoId: number | string) =>
      `${API_BASE_URL}/properties/${id}/photos/${photoId}/`,
    similar: (id: number | string) => `${API_BASE_URL}/properties/${id}/similar/`,
    submitForReview: (id: number | string) =>
      `${API_BASE_URL}/properties/${id}/submit_for_review/`,
    markRented: (id: number | string) =>
      `${API_BASE_URL}/properties/${id}/mark_rented/`,
  },
  favorites: {
    list: `${API_BASE_URL}/favorites/`,
    add: `${API_BASE_URL}/favorites/`,
    remove: (propertyId: number | string) =>
      `${API_BASE_URL}/favorites/by-property/${propertyId}/`,
  },
  messages: {
    list: `${API_BASE_URL}/messages/`,
    details: (id: number | string) => `${API_BASE_URL}/messages/${id}/`,
    inbox: `${API_BASE_URL}/messages/inbox/`,
    sent: `${API_BASE_URL}/messages/sent/`,
    send: `${API_BASE_URL}/messages/`,
    thread: (propertyId: number | string) =>
      `${API_BASE_URL}/messages/thread/${propertyId}/`,
    markAsRead: (id: number | string) => `${API_BASE_URL}/messages/${id}/mark_as_read/`,
    unreadCount: `${API_BASE_URL}/messages/unread_count/`,
    conversations: `${API_BASE_URL}/messages/conversations/`,
    markThreadRead: (propertyId: number | string) =>
      `${API_BASE_URL}/messages/thread/${propertyId}/mark_read/`,
  },
  notifications: {
    list: `${API_BASE_URL}/notifications/`,
    unreadCount: `${API_BASE_URL}/notifications/unread_count/`,
    markRead: (id: number | string) => `${API_BASE_URL}/notifications/${id}/mark_read/`,
    markAllRead: `${API_BASE_URL}/notifications/mark_all_read/`,
    preferences: `${API_BASE_URL}/notifications/preferences/`,
  },
  amenities: {
    list: `${API_BASE_URL}/amenities/`,
    create: `${API_BASE_URL}/amenities/`,
  },
  reports: {
    list: `${API_BASE_URL}/reports/`,
    create: `${API_BASE_URL}/reports/`,
    review: (id: number | string) => `${API_BASE_URL}/reports/${id}/review/`,
    resolve: (id: number | string) => `${API_BASE_URL}/reports/${id}/resolve/`,
    dismiss: (id: number | string) => `${API_BASE_URL}/reports/${id}/dismiss/`,
  },
  admin: {
    users: `${API_BASE_URL}/auth/admin/users/`,
    suspendUser: (id: number | string) => `${API_BASE_URL}/auth/admin/users/${id}/suspend/`,
    activateUser: (id: number | string) => `${API_BASE_URL}/auth/admin/users/${id}/activate/`,
    pendingProperties: `${API_BASE_URL}/properties/admin/properties/pending/`,
    propertiesList: `${API_BASE_URL}/properties/admin/properties/`,
    approveProperty: (id: number | string) =>
      `${API_BASE_URL}/properties/admin/properties/${id}/approve/`,
    publishProperty: (id: number | string) =>
      `${API_BASE_URL}/properties/admin/properties/${id}/publish/`,
    rejectProperty: (id: number | string) =>
      `${API_BASE_URL}/properties/admin/properties/${id}/reject/`,
  },
  billing: {
    products: `${API_BASE_URL}/billing/products/`,
    me: `${API_BASE_URL}/billing/me/`,
    boost: `${API_BASE_URL}/billing/boost/`,
    subscribe: `${API_BASE_URL}/billing/subscribe/`,
    order: (id: number | string) => `${API_BASE_URL}/billing/orders/${id}/`,
  },
} as const;
