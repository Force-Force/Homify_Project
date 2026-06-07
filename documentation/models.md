# Models & Architecture

The database architecture is designed to support a multi-role rental marketplace.

## 1. User Model (`apps/users`)

The custom `User` model replaces Django's default user, using `email` as the primary identifier.

- **Roles**: `VISITOR`, `TENANT`, `LANDLORD`, `ADMIN`
- **Status**: `ACTIVE`, `SUSPENDED`, `DELETED`
- **Fields**: Email, First Name, Last Name, Phone, Role, Status, Email Verified.

## 2. Property Models (`apps/properties`)

This is the core domain of the application, split into several related models.

### Property
- **Relations**: Linked to `User` (Landlord).
- **Types**: `HOUSE`, `APARTMENT`, `STUDIO`, `ROOM`.
- **Status**: `DRAFT`, `PENDING`, `APPROVED`, `REJECTED`, `PUBLISHED`, `RENTED`, `DELETED`.
- **Fields**: Title, Description, Type, Surface, Rooms, Bedrooms, Bathrooms, Floor, Furnished.
- **Pricing**: Monthly Rent, Charges, Deposit, Agency Fees.
- **Metrics**: View Count.

### Address
- **Relations**: One-to-One with `Property`.
- **Fields**: Street Address, City, Postal Code, District, Latitude, Longitude.

### Photo
- **Relations**: Foreign Key to `Property`.
- **Fields**: Image, Thumbnail, Is Primary, Order.

## 3. Amenity Model (`apps/amenities`)

Manages the equipment and features available in properties.
- **Relations**: Many-to-Many with `Property`.
- **Categories**: `COMFORT`, `SECURITY`, `CONNECTIVITY`, `EXTERIOR`.
- **Fields**: Name, Icon, Category.

## 4. Message Model (`apps/chat`)

Facilitates communication between users regarding specific properties.
- **Relations**: 
  - Sender (`User`)
  - Recipient (`User`)
  - Property (`Property`)
- **Fields**: Subject, Content, Is Read, Sent At, Read At.

## 5. Favorite Model (`apps/favorites`)

Allows users to save properties they are interested in.
- **Relations**: 
  - User (`User`)
  - Property (`Property`)
- **Constraints**: Unique together constraint on User and Property.

## 6. Report Model (`apps/reports`)

Content moderation system for users to flag properties or other users.
- **Relations**:
  - Reporter (`User`)
  - Property (Optional, `Property`)
  - Reported User (Optional, `User`)
- **Reasons**: `FRAUD`, `INAPPROPRIATE`, `DUPLICATE`, `OTHER`.
- **Status**: `PENDING`, `REVIEWED`, `RESOLVED`, `DISMISSED`.
- **Fields**: Reason, Description, Status, Timestamps.
