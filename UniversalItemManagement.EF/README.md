# UniversalItemManagement.EF

Entity Framework Core data layer for the Universal Item Management system. This project contains the domain models, database context, migrations, and repositories for managing flexible, user-defined data structures.

## Table of Contents
- [Overview](#overview)
- [Domain Models](#domain-models)
  - [Base Classes and Interfaces](#base-classes-and-interfaces)
  - [Entity Classes](#entity-classes)
  - [Field System](#field-system)
- [Database Schema](#database-schema)
- [Architecture](#architecture)

## Overview

This project implements a flexible field-based data management system that allows users to create custom records with dynamic field types. The system supports multiple field types (Text, Date, Boolean) with extensible value storage.

## Domain Models

### Base Classes and Interfaces

#### Entity
**Location:** [Domain/Models/Entity.cs](Domain/Models/Entity.cs)

Base class for all entities in the system, providing common auditing and tracking functionality.

**Properties:**
- `Id` (Guid): Unique identifier, primary key
- `CreatedOn` (DateTime?): Timestamp when entity was created
- `ModifiedOn` (DateTime?): Timestamp when entity was last modified
- `CreatedById` (Guid?): Foreign key to User who created the entity
- `ModifiedById` (Guid?): Foreign key to User who last modified the entity
- `CreatedBy` (User): Navigation property to creator
- `ModifiedBy` (User): Navigation property to last modifier

**Purpose:** Provides audit trail and ownership tracking for all domain entities.

#### INamedEntity
**Location:** [Domain/Models/INamedEntity.cs](Domain/Models/INamedEntity.cs)

Interface for entities that have a name property.

**Properties:**
- `Name` (string): The name of the entity

### Entity Classes

#### User
**Location:** [Domain/Models/Entities/User.cs](Domain/Models/Entities/User.cs)

Represents a user in the system.

**Properties:**
- `Id` (Guid): Unique identifier, primary key
- `Name` (string): User's name (required)
- `Email` (string): User's email address (required)
- `CreatedOn` (DateTime): When the user was created (required)
- `ModifiedOn` (DateTime): When the user was last modified (required)

**Database Table:** `Users`

#### Record
**Location:** [Domain/Models/Entities/Record.cs](Domain/Models/Entities/Record.cs)

Represents a data record that can contain multiple fields. Inherits from `Entity` and implements `INamedEntity`.

**Properties:**
- Inherits all properties from `Entity`
- `Name` (string): Name of the record (identity/label)
- `Description` (string): Description of the record
- `Fields` (ICollection<Field>): Collection of dynamic fields belonging to this record

**Database Table:** `Records`

**Purpose:** Acts as a container for user-defined field collections, enabling flexible data structures.

### Field System

The field system provides a flexible, extensible architecture for storing different types of data values.

#### Field
**Location:** [Domain/Models/Entities/Fields/Field.cs](Domain/Models/Entities/Fields/Field.cs)

Represents a field instance within a record, including positioning and value information.

**Properties:**
- Inherits all properties from `Entity`
- `X` (int): X-coordinate for field positioning
- `Y` (int): Y-coordinate for field positioning
- `Width` (int): Width of the field
- `Height` (int): Height of the field
- `TextValueId` (Guid?): Nullable foreign key to FieldValue (for text fields)
- `TextValue` (FieldValue): Navigation property to text value
- `BooleanValueId` (Guid?): Nullable foreign key to BooleanValue (for boolean fields)
- `BooleanValue` (BooleanValue): Navigation property to boolean value
- `DateValueId` (Guid?): Nullable foreign key to DateValue (for date fields)
- `DateValue` (DateValue): Navigation property to date value
- `PropertyId` (Guid): Foreign key to FieldProperty
- `Property` (FieldProperty): Navigation property to the field's property definition
- `RecordId` (Guid): Foreign key to parent Record
- `Record` (Record): Navigation property to parent record

**Database Table:** `Field`

**Purpose:** Links a record to a specific field value with positional metadata, allowing for UI layout control. Uses nullable foreign keys to support multiple value types - only one value FK is populated based on FieldProperty.Type.

#### FieldProperty
**Location:** [Domain/Models/Entities/Fields/FieldProperty.cs](Domain/Models/Entities/Fields/FieldProperty.cs)

Defines the metadata and type information for a field.

**Properties:**
- Inherits all properties from `Entity`
- `Name` (string): Name of the field property
- `Type` (FieldPropertyType): The type of field (Text, Date, or Boolean)

**Database Table:** `FieldProperty`

**FieldPropertyType Enum:**
- `Text`: Text-based field
- `Date`: Date/time field
- `Boolean`: Boolean/checkbox field

**Purpose:** Acts as a template/definition for field types, stored as strings in the database.

#### FieldValue
**Location:** [Domain/Models/Entities/Fields/Values/FieldValue.cs](Domain/Models/Entities/Fields/Values/FieldValue.cs)

Stores the actual value for text-based fields. Inherits from `Entity`.

**Properties:**
- Inherits all properties from `Entity`
- `ValueId` (Guid): Value identifier
- `TextValue` (string): The text value content

**Database Table:** `FieldValue`

**Purpose:** Primary value storage for text fields.

#### BooleanValue
**Location:** [Domain/Models/Entities/Fields/Values/BooleanValue.cs](Domain/Models/Entities/Fields/Values/BooleanValue.cs)

Stores boolean field values.

**Properties:**
- `Id` (Guid): Primary key
- `ValueId` (Guid): Value identifier
- `Value` (bool): The boolean value

**Database Table:** `BooleanValue`

**Purpose:** Stores boolean/checkbox field values. Does not inherit from Entity as audit tracking is handled by the Field entity that references it.

#### DateValue
**Location:** [Domain/Models/Entities/Fields/Values/DateValue.cs](Domain/Models/Entities/Fields/Values/DateValue.cs)

Stores date/time field values.

**Properties:**
- `Id` (Guid): Primary key
- `ValueId` (Guid): Value identifier
- `Value` (DateTime): The date/time value

**Database Table:** `DateValue`

**Purpose:** Stores date/time field values. Does not inherit from Entity as audit tracking is handled by the Field entity that references it.

#### IFieldValue\<T\>
**Location:** [Domain/Models/Entities/Fields/Values/IFieldValue.cs](Domain/Models/Entities/Fields/Values/IFieldValue.cs)

Generic interface for field values.

**Properties:**
- `ValueId` (Guid): Value identifier

**Purpose:** Provides a contract for implementing type-specific field values.

### Contracts

#### IContractable\<E, OE\>
**Location:** [Domain/Contracts/IContractable.cs](Domain/Contracts/IContractable.cs)

Abstract base class for mapping between DTOs and entities.

**Type Parameters:**
- `E`: Entity type that inherits from Entity
- `OE`: The contract type itself

**Methods:**
- `MapEntity()`: Maps the contract object to its corresponding entity type using reflection

**Purpose:** Provides automatic mapping functionality between contract/DTO objects and domain entities.

#### IItem
**Location:** [Domain/Contracts/IItem.cs](Domain/Contracts/IItem.cs)

Basic interface for items with an identifier.

**Properties:**
- `Id` (Guid): Unique identifier

## Database Schema

### Tables

#### Users
Primary table for user management.

| Column | Type | Constraints |
|--------|------|-------------|
| Id | uniqueidentifier | PRIMARY KEY |
| Name | nvarchar(max) | NOT NULL |
| Email | nvarchar(max) | NOT NULL |
| CreatedOn | datetime2 | NOT NULL, DEFAULT GETDATE() |
| ModifiedOn | datetime2 | NOT NULL, DEFAULT GETDATE() |

**Seed Data:**
- System User: `00000000-0000-0000-0000-000000000001`

#### Records
Stores record instances.

| Column | Type | Constraints |
|--------|------|-------------|
| Id | uniqueidentifier | PRIMARY KEY |
| Name | nvarchar(max) | NOT NULL |
| Description | nvarchar(max) | NOT NULL |
| CreatedOn | datetime2 | NOT NULL, DEFAULT GETDATE() |
| ModifiedOn | datetime2 | NOT NULL, DEFAULT GETDATE() |
| CreatedById | uniqueidentifier | FOREIGN KEY → Users(Id) |
| ModifiedById | uniqueidentifier | FOREIGN KEY → Users(Id) |

**Indexes:**
- `IX_Records_CreatedById`
- `IX_Records_ModifiedById`

**Seed Data:**
- Test Record: `342ea86c-fc10-4c46-b833-b94aac3a6772`

#### FieldProperty
Defines field types and properties.

| Column | Type | Constraints |
|--------|------|-------------|
| Id | uniqueidentifier | PRIMARY KEY |
| Name | nvarchar(max) | NOT NULL |
| Type | nvarchar(max) | NOT NULL (stored as string enum) |
| CreatedOn | datetime2 | NOT NULL, DEFAULT GETDATE() |
| ModifiedOn | datetime2 | NOT NULL, DEFAULT GETDATE() |
| CreatedById | uniqueidentifier | FOREIGN KEY → Users(Id) |
| ModifiedById | uniqueidentifier | FOREIGN KEY → Users(Id) |

**Indexes:**
- `IX_FieldProperty_CreatedById`
- `IX_FieldProperty_ModifiedById`

**Type Values:** "Text", "Date", "Boolean"

#### FieldValue
Stores text field values.

| Column | Type | Constraints |
|--------|------|-------------|
| Id | uniqueidentifier | PRIMARY KEY |
| ValueId | uniqueidentifier | NOT NULL |
| TextValue | nvarchar(max) | NOT NULL |
| CreatedOn | datetime2 | NOT NULL, DEFAULT GETDATE() |
| ModifiedOn | datetime2 | NOT NULL, DEFAULT GETDATE() |
| CreatedById | uniqueidentifier | FOREIGN KEY → Users(Id) |
| ModifiedById | uniqueidentifier | FOREIGN KEY → Users(Id) |

**Indexes:**
- `IX_FieldValue_CreatedById`
- `IX_FieldValue_ModifiedById`

#### BooleanValue
Stores boolean field values.

| Column | Type | Constraints |
|--------|------|-------------|
| Id | uniqueidentifier | PRIMARY KEY |
| ValueId | uniqueidentifier | NOT NULL |
| Value | bit | NOT NULL |

#### DateValue
Stores date/time field values.

| Column | Type | Constraints |
|--------|------|-------------|
| Id | uniqueidentifier | PRIMARY KEY |
| ValueId | uniqueidentifier | NOT NULL |
| Value | datetime2 | NOT NULL |

#### Field
Links records to field values with positioning data.

| Column | Type | Constraints |
|--------|------|-------------|
| Id | uniqueidentifier | PRIMARY KEY |
| X | int | NOT NULL |
| Y | int | NOT NULL |
| Width | int | NOT NULL |
| Height | int | NOT NULL |
| TextValueId | uniqueidentifier | NULLABLE, FOREIGN KEY → FieldValue(Id) CASCADE |
| BooleanValueId | uniqueidentifier | NULLABLE, FOREIGN KEY → BooleanValue(Id) CASCADE |
| DateValueId | uniqueidentifier | NULLABLE, FOREIGN KEY → DateValue(Id) CASCADE |
| PropertyId | uniqueidentifier | NOT NULL, FOREIGN KEY → FieldProperty(Id) CASCADE |
| RecordId | uniqueidentifier | NOT NULL, FOREIGN KEY → Records(Id) CASCADE |
| CreatedOn | datetime2 | NOT NULL, DEFAULT GETDATE() |
| ModifiedOn | datetime2 | NOT NULL, DEFAULT GETDATE() |
| CreatedById | uniqueidentifier | FOREIGN KEY → Users(Id) |
| ModifiedById | uniqueidentifier | FOREIGN KEY → Users(Id) |

**Indexes:**
- `IX_Field_CreatedById`
- `IX_Field_ModifiedById`
- `IX_Field_PropertyId`
- `IX_Field_RecordId`
- `IX_Field_TextValueId`
- `IX_Field_BooleanValueId`
- `IX_Field_DateValueId`

### Relationships

```
Users (1) ----< (∞) Records [CreatedBy/ModifiedBy]
Users (1) ----< (∞) FieldProperty [CreatedBy/ModifiedBy]
Users (1) ----< (∞) FieldValue [CreatedBy/ModifiedBy]
Users (1) ----< (∞) Field [CreatedBy/ModifiedBy]

Records (1) ----< (∞) Field [RecordId]
FieldProperty (1) ----< (∞) Field [PropertyId]
FieldValue (1) ----< (0..∞) Field [TextValueId] (nullable)
BooleanValue (1) ----< (0..∞) Field [BooleanValueId] (nullable)
DateValue (1) ----< (0..∞) Field [DateValueId] (nullable)

Note: Each Field has exactly one value reference (TextValueId, BooleanValueId, or DateValueId)
based on its FieldProperty.Type
```

### Entity Relationship Diagram

```
┌─────────────┐
│   Users     │
│  (System)   │
└──────┬──────┘
       │ Creates/Modifies
       │ (all entities)
       ├──────────────┬──────────────┬──────────────┐
       │              │              │              │
       ▼              ▼              ▼              ▼
┌────────────┐ ┌──────────────┐ ┌────────────┐ ┌──────────┐
│  Records   │ │FieldProperty │ │ FieldValue │ │  Field   │
└─────┬──────┘ └──────┬───────┘ └─────┬──────┘ └────┬─────┘
      │               │               │              │
      │               │               │              │
      └───────────────┴───────────────┴──────────────┘
                      │
              ┌───────┴───────┐
              │     Field     │
              │  (Composite)  │
              └───────────────┘
          Properties: X, Y, Width, Height
```

## Architecture

### Database Context
**Location:** [Domain/Infrastructure/Context.cs](Domain/Infrastructure/Context.cs)

The `Context` class extends `DbContext` and provides:
- DbSet properties for `Records`, `Users`, `BooleanValues`, and `DateValues`
- Automatic audit field population (CreatedOn, ModifiedOn, CreatedById, ModifiedById)
- Dynamic entity configuration using reflection for all Entity descendants
- SQL Server database connection via environment variable `DB_CONNECTION_STRING`
- Seed data loading for Users and Records
- Manual configuration for BooleanValue and DateValue entities (non-Entity classes)
- Polymorphic value relationships for Field entities

**Key Features:**
- **Automatic Auditing:** Overrides `SaveChanges()` to automatically populate audit fields
- **Dynamic Configuration:** Uses reflection to find and configure all entities inheriting from `Entity`
- **Enum to String Conversion:** Converts `FieldPropertyType` enum to string for database storage
- **Seed Data Management:** Initializes system user and test records

### Repositories
Located in `Domain/Services/Repositories/`:
- `EntityRepository`: Generic repository for entity operations
- `RecordRepository`: Specialized repository for Record entities

### Configuration
- Database connection configured via `DB_CONNECTION_STRING` environment variable
- Uses SQL Server as the database provider
- Sensitive data logging enabled in DEBUG mode

## Migrations

**Current Migration:** `20250227225458_InitialFieldSetup`

This migration creates all core tables and relationships for the field management system.

## Usage

1. Set the `DB_CONNECTION_STRING` environment variable to your SQL Server connection string
2. Run migrations to create the database schema
3. The system user and test record will be seeded automatically

## Notes

- The field system supports Text, Boolean, and Date value types
- The field system is designed to be extensible for future value types
- All entities except `User`, `BooleanValue`, and `DateValue` inherit from the `Entity` base class for consistent auditing
- BooleanValue and DateValue do not inherit from Entity; audit tracking is handled by the Field entity that references them
- Foreign key relationships use `ClientSetNull` delete behavior for audit fields to preserve history
- Records use dynamic Field instances for flexible data storage while maintaining Name and Description for identity
- Field uses nullable foreign keys (TextValueId, BooleanValueId, DateValueId) to support polymorphic value storage
