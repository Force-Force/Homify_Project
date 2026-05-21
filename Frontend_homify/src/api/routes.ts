export const API_BASE_URL = 'http://localhost:8000/api';

export const API_ROUTES = {
  auth: {
    register: `${API_BASE_URL}/auth/register/`,
    login: `${API_BASE_URL}/auth/login/`,
    refresh: `${API_BASE_URL}/auth/refresh/`,
    me: `${API_BASE_URL}/auth/me/`,
    changePassword: `${API_BASE_URL}/auth/me/password/`,
    social: `${API_BASE_URL}/auth/social/`,
    forgotPassword: `${API_BASE_URL}/auth/forgot-password/`,
  },
  properties: {
    list: `${API_BASE_URL}/properties/`,
    details: (id: number | string) => `${API_BASE_URL}/properties/${id}/`,
    myProperties: `${API_BASE_URL}/properties/my_properties/`,
    uploadPhotos: (id: number | string) => `${API_BASE_URL}/properties/${id}/upload_photos/`,
    deletePhoto: (id: number | string, photoId: number | string) => `${API_BASE_URL}/properties/${id}/photos/${photoId}/`,
    similar: (id: number | string) => `${API_BASE_URL}/properties/${id}/similar/`,
  },
  favorites: {
    list: `${API_BASE_URL}/favorites/`,
    add: `${API_BASE_URL}/favorites/`,
    remove: (propertyId: number | string) => `${API_BASE_URL}/favorites/${propertyId}/`,
  },
  messages: {
    list: `${API_BASE_URL}/messages/`,
    inbox: `${API_BASE_URL}/messages/inbox/`,
    sent: `${API_BASE_URL}/messages/sent/`,
    send: `${API_BASE_URL}/messages/`,
    markAsRead: (id: number | string) => `${API_BASE_URL}/messages/${id}/mark_as_read/`,
    unreadCount: `${API_BASE_URL}/messages/unread_count/`,
  },
  amenities: {
    list: `${API_BASE_URL}/amenities/`,
    create: `${API_BASE_URL}/amenities/`,
  },
  reports: {
    list: `${API_BASE_URL}/reports/`,
    create: `${API_BASE_URL}/reports/`,
    resolve: (id: number | string) => `${API_BASE_URL}/reports/${id}/resolve/`,
    dismiss: (id: number | string) => `${API_BASE_URL}/reports/${id}/dismiss/`,
  },
  admin: {
    users: `${API_BASE_URL}/auth/admin/users/`,
    suspendUser: (id: number | string) => `${API_BASE_URL}/auth/admin/users/${id}/suspend/`,
    activateUser: (id: number | string) => `${API_BASE_URL}/auth/admin/users/${id}/activate/`,
    pendingProperties: `${API_BASE_URL}/properties/admin/properties/pending/`,
    approveProperty: (id: number | string) => `${API_BASE_URL}/properties/admin/properties/${id}/approve/`,
    rejectProperty: (id: number | string) => `${API_BASE_URL}/properties/admin/properties/${id}/reject/`,
  },
} as const;
