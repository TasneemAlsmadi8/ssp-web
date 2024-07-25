# Quick Overview: JSON Configuration for PDF Generation

## Introduction

This guide provides a brief overview of the JSON syntax and structure used in our PDF generation library, which helps create customized PDFs by combining static settings and dynamic data.

## JSON File Structure

A JSON configuration file typically includes:

1. **fileName**: Name of the generated PDF.
2. **pageOptions**: Page dimensions, margins, orientation, and optional template URL.
3. **styles**: Global styles for the PDF, using a CSS-like syntax.
4. **variables**: Global variables used throughout the document.
5. **template**: Reusable template settings.
6. **templateFileName**: Filename for an external template.
7. **elements**: Content elements for the PDF.
8. **input**: User-provided values for PDF generation (optional).
9. **data**: Dynamic data from sources like databases or APIs (optional).

## Page Settings

- **Dimensions**: Defines page height and width.
- **Margins**: Sets margins around content.
- **Options**: Includes dimensions, margins, optional template PDF page URL, and orientation (portrait/landscape).

## Styles

- **CSS-Like Syntax**: Styles are defined using a syntax similar to CSS, allowing for easy and flexible styling.
- **Global Styles**: Apply default styles to the entire document.
- **Element-Specific Styles**: Override global styles for specific elements.
- **Children Styles Selectors**: Apply styles to specific child elements based on criteria (e.g., odd/even).

## Elements

Defines content types such as:

1. **Heading**: Titles or headers.
2. **Paragraph**: Blocks of text.
3. **Table**: Tabular data.
4. **Object Table**: Data in object form.
5. **Auto Table**: Dynamically generated tables.
6. **Horizontal Container**: Organizes elements horizontally.
7. **Vertical Container**: Organizes elements vertically.

## Variables and Pipes

- **Variables**: Placeholders replaced with actual values during PDF generation. They can be global, input, or data-specific.
- **Pipes**: Formatting rules applied to variables (e.g., number or date formatting).

## Templates

Templates define reusable content and styles, ensuring consistency across documents. Attributes include:

- **name**: Unique template identifier (optional).
- **pageMargins**: Page margin settings (optional).
- **pageOptions**: Page settings (optional).
- **styles**: Default styles (optional).
- **variables**: Variables available in the template (optional).
- **elements**: Content elements in the template (optional).

&nbsp;

---

&nbsp;

&nbsp;

&nbsp;

# JSON File Syntax overview

## Introduction

This overview outlines the syntax and structure of JSON configuration files used with our PDF generation library. This library facilitates the dynamic creation of PDFs by defining page settings, styles, elements, and data-driven content within a JSON file. It combines static configuration and dynamic data to produce tailored PDF documents, suitable for various applications like reports, invoices, and brochures.

## Structure of the JSON File

A typical JSON configuration file consists of the following top-level attributes:

1. **fileName**: The name of the generated PDF file.
2. **pageOptions**: Configuration for page dimensions and margins.
3. **styles**: Global styles applied on the PDF body.
4. **variables**: Global variables used throughout the PDF.
5. **template**: Reusable template settings for the PDF.
6. **templateFileName**: Filename for an external template.
7. **elements**: Array of elements that define the content of the PDF.
8. **input**: Values provided by the user as criteria for PDF generation. (may be added in code)
9. **data**: Dynamic data form sources such as database queries or API calls. (may be added in code)

## Page Settings

The `pageOptions` section defines the dimensions, margins, orientation, and template URL for the PDF document. These settings determine the overall layout and structure of the PDF.

### Page Dimensions

The `PageDimensions` interface specifies the height and width of the PDF pages.

### Page Margins

The `PageMargins` interface defines the margins around the content of each page.

### Page Options

The `PageOptions` interface combines `PageDimensions` and `PageMargins`, and adds optional attributes for template URL and page orientation.

- **templateUrl**: (Optional) URL of an external template to use for the PDF.
- **pageOrientation**: (Optional) Orientation of the page, either `portrait` or `landscape`.

**Note:** Default page options use the dimensions of an A4 page with all margins set to 50 units.

## Styles

The `styles` section of the JSON configuration file allows you to define and apply styles to various elements within the PDF document. Styles control the visual appearance of text, borders, colors, and positioning of elements.

### Style Object

The `Style` interface defines a comprehensive set of styling properties that can be applied to elements.

### Common Style Properties

- **font**: The font family (e.g., 'TimesRoman', 'Helvetica', 'Courier', 'Noto Sans', or any other embedded font).
- **font-size**: The size of the font (e.g., 12).
- **font-weight**: The weight of the font (e.g., 'normal', 'bold').
- **text-decoration**: Text decoration (e.g., 'none', 'underline').
- **color**: Text color (e.g., '#000000' for black).
- **background-color**: Background color (e.g., '#FFFFFF' for white).
- **margin**: Margin around the element (e.g., 10).
- **padding**: Padding inside the element (e.g., 10).
- **border**: Border width (e.g., 1).
- **border-color**: Border color (e.g., '#000000').
- **position**: Positioning of the element (e.g., 'static', 'relative', 'fixed').
- **top, right, bottom, left**: Position offsets (e.g., 10).
- **width**: Width of the element (e.g., 'max-width', 'fit-content').
- **height**: Height of the element (e.g., 'fit-content').

### Global Styles

Global styles are defined at the top level of the JSON configuration and apply to the body of the document, setting the default appearance for the entire document.

### Style Inheritance

Element-specific styles can override global styles, but they also inherit certain properties from the parent element's styles. The following styles are inherited from the parent element: `font`, `font-size`, `font-weight`, `text-decoration`, `color`.

### Shorthand Styles

Shorthand styles such as `margin`, `padding`, and `border` can be overridden by more specific properties.

### Element-Specific Styles

Element-specific styles override the inherited and global styles for that particular element. These are defined within each element's `styles` attribute.

**Note:** To embed fonts, use `ElementStyleCalculator` or `PdfBuilder` methods to add fonts from URLs. If the used font cannot encode any character, a custom 'Noto Sans' font is used as a fallback.

With these styles defined, the PDF will have a consistent appearance while allowing for customization at the element level. Elements inherit the global styles unless explicitly overridden.

## Elements

The `elements` section of the JSON configuration file defines the different types of content included in the PDF document. Each element has its own attributes and styles, and can be organized into containers or stand-alone items.

### Element Types

Each element in the `elements` array must specify its type and can include various attributes depending on the element type. The available element types are:

1. **Heading**
2. **Paragraph**
3. **Table**
4. **Object Table**
5. **Auto Table**
6. **Horizontal Container**
7. **Vertical Container**

#### 1. **Heading**: Represents a header or title.

- **Attributes**:
  - `type`: `'heading'` or `'h'`
  - `level`: Numeric value indicating the heading level
  - `text`: The text content of the heading
  - `styles`: Optional styles

#### 2. **Paragraph**: Represents a block of text.

- **Attributes**:
  - `type`: `'paragraph'` or `'p'`
  - `text`: The text content of the paragraph
  - `styles`: Optional styles

#### 3. **Table**: Represents a tabular data structure.

- **Attributes**:
  - `type`: `'table'` or `'t'`
  - `data`: A 2D array of `TableCell` objects
  - `cellStyles`: Optional styles for all table cells
  - `rowStyles`: Optional styles for rows based on criteria
  - `columnStyles`: Optional styles for columns based on criteria
  - `columnsRatio`: Optional array defining relative width of each column

#### 4. **Object Table**: Represents a tabular structure with data in object form.

- **Attributes**:
  - `type`: `'object-table'`, `'o-table'`, or `'obj-table'`
  - `data`: An array or single `DataRecord` object
  - `headersPlacement`: Optional headers placement ('row' or 'column')
  - `hideHeaders`: Optional boolean to hide headers
  - `headerStyles`: Optional styles for headers
  - `cellStyles`: Optional styles for cells
  - `rowStyles`: Optional styles for rows based on criteria
  - `columnStyles`: Optional styles for columns based on criteria
  - `columnsRatio`: Optional array defining relative width of each column

#### 5. **Auto Table**: Dynamically generated tables based on a schema.

- **Attributes**:
  - `type`: `'auto-table'` or `'a-table'`
  - `schema`: Record mapping headers to data field keys
  - `tableDataKey`: Required if data is `MultiDataRecords`
  - `headersPlacement`: Optional headers placement ('row' or 'column')
  - `hideHeaders`: Optional boolean to hide headers
  - `headerStyles`: Optional styles for headers
  - `cellStyles`: Optional styles for cells
  - `rowStyles`: Optional styles for rows based on criteria
  - `columnStyles`: Optional styles for columns based on criteria
  - `columnsRatio`: Optional array defining relative width of each column

#### 6. **Horizontal Container**: Organizes elements horizontally.

- **Attributes**: - `type`: `'horizontal-container'` or `'h-container'` - `widths`: Array of `MaxWidth` values for each child element - `elements`: Array of child `ElementJson` objects

  **Note:** Valid values for `MaxWidth` could be: (`"100"`, `"50%"`, `"75%+10"`, `"30%-5"`, `"20+80%"`)

#### 7. **Vertical Container**: Organizes elements vertically.

- **Attributes**:
  - `type`: `'vertical-container'` or `'v-container'`
  - `elements`: Array of child `ElementJson` objects

## Children Styles Selectors

**Children Styles Selectors** allow specific styles to be applied to child elements within containers based on criteria such as odd/even positioning or specific child numbers. This is particularly useful for dynamically styling elements like rows in tables or items in lists.

### Definition

`ChildrenStylesSelectors` is a type that applies styles to children based on specific selector criteria. If multiple criteria are specified, the more specific overrides the less specific.

```typescript
export type ChildrenStylesSelectors = Partial<Record<`${number}` | "odd" | "even" | "first" | "last", Style>>;
```

### Selectors

1. **Numeric Index (`${number}`)**

   - Targets a specific child element by its index, starting from `1`.

2. **Odd**

   - Targets child elements with odd indices (1st, 3rd, 5th, etc.).

3. **Even**

   - Targets child elements with even indices (2nd, 4th, 6th, etc.).

4. **First**

   - Targets the first child element.

5. **Last**
   - Targets the last child element.

### Usage

Include `ChildrenStylesSelectors` in `rowStyles`, `columnStyles`, or similar properties to apply conditional styling to child elements. This allows for sophisticated and dynamic styles, enhancing the visual appeal and readability of the PDF content.

## Variables and Pipes

### Introduction

The `variables` section of the JSON configuration allows defining dynamic content and placeholders that can be resolved and replaced with actual values when generating the PDF. This section supports various scopes, providing flexibility in how data is injected into the PDF document.

### Variable Syntax

Placeholders in text are defined using double curly braces `{{ }}` and can include variable names, pipes, and arguments for formatting.

- **Variable Only:** `{{variableName}}`
- **Variable with Pipe:** `{{variableName|pipeName:args}}`

### Variable Scopes

#### Global Variables

Global variables are available for use in element text content, including:

1. **PDF JSON Variables:** Defined in the `variables` attribute of the `pdfJson` object.
2. **Template Variables:** Inherited from the template JSON document.
3. **Additional Variables:** Provided via the `additionalVariables` parameter.
4. **Special Variable:** `date` representing the current date.

#### Input Variables

Provided by the user as criteria for PDF generation, prefixed with `input.` and available in element text.

#### Data Variables

**Data Variables** are sourced dynamically from databases or APIs and can be used in `pdfJson`.

They can be provided in two formats:

1. **Single Array:**

   - **Format:** Provided as an array of `DataRecord` objects.
   - **Usage:** Access items using `{{data.index.property}}`, where `index` starts at 0. For example, `{{data.1.item}}` accesses the `item` property of the second item.

2. **Multiple Arrays:**
   - **Format:** Provided as a dictionary of arrays (e.g., `orders`, `customers`).
   - **Usage:** Access items from different sources using `{{data.key.index.property}}`. For example, `{{data.customers.0.name}}` accesses the `name` property of the first item in the `customers` array, while `{{data.orders.item}}` accesses the `item` property from the `orders` array.

**Definitions:**

- **DataRecord:** A record with keys and values of string, number, null, or undefined.
- **MultiDataRecords:** A dictionary where each key maps to an array of `DataRecord` objects.

#### Template-Specific Variables

Available only within the template context, including:

- `pageNum`: Current page number.
- `totalPages`: Total number of pages.

#### AutoTable-Specific Variables

Used in the schema of an Auto Table, including:

- `serialNumber`: Row number.
- `row.{keyName}`: Data provided in the row.

### Pipes

Pipes are used to format values dynamically in templates. They allow specific formatting rules, such as number or date formatting, to be applied to variables.

#### Default Pipes

1. **Number Pipe:** Formats a number based on the specified format.
2. **Date Pipe:** Formats a date string based on the specified format.

#### Custom Pipes

Custom pipes can be defined and registered for specific formatting needs.

### Summary

Variables and pipes are powerful tools for generating dynamic and formatted content in PDF documents. By understanding and utilizing global variables, input variables, data variables, and various formatting pipes, you can create highly customizable and professional-looking PDFs tailored to your specific needs.

## Templates

Templates in JSON configuration offer a way to define reusable content and structure for PDFs, ensuring consistency and reducing duplication across multiple documents.

### Definition

A template is defined using the `PdfJsonTemplate` interface, which includes attributes for page margins, page options, styles, variables, and elements. Templates are ideal for setting up recurring elements like headers, footers, or standardized sections.

### Attributes

1. **`name` (optional)**

   - A unique identifier for the template.

2. **`pageMargins` (optional)**

   - Specifies margins for the pages, controlling the space between content and page edges.

3. **`pageOptions` (optional)**

   - Defines additional page settings such as dimensions and orientation.

4. **`styles` (optional)**

   - Sets default styles for elements within the template.

5. **`variables` (optional)**

   - Lists variables available within the template, including global and template-specific variables.

6. **`elements` (optional)**
   - Specifies the elements to include in the template, such as headings, paragraphs, tables, and containers.

### Usage

Templates can be applied in `pdfJson` to standardize content across PDFs. By specifying a template, common elements and styles are consistently applied, while allowing for customization of specific elements and data.
