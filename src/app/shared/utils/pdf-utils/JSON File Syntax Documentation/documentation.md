# JSON File Syntax Documentation for PDF Generation Library

## Introduction

This documentation outlines the syntax and structure of JSON configuration files used with our PDF generation library. This library enables dynamic creation of PDFs by defining page settings, styles, elements, and data-driven content within a JSON file. The library leverages a combination of static configuration and dynamic data to produce tailored PDF documents, suitable for various applications such as reports, invoices, and brochures.

The JSON configuration file is divided into several sections, each serving a specific purpose in defining the PDF's content and appearance. The key components include page settings, styles, elements, special variables and scopes, and pipes for placeholder replacement.

In the following sections, we will detail each part of the JSON configuration, providing syntax guidelines and examples to help you create effective PDF templates.

---

## Structure of the JSON File

A typical JSON configuration file for this library consists of the following top-level attributes:

1. **fileName**: The name of the generated PDF file.
2. **pageOptions**: Configuration for page dimensions and margins.
3. **styles**: Global styles applied across the PDF.
4. **variables**: Global variables used throughout the PDF.
5. **template**: Reusable template settings for the PDF.
6. **templateFileName**: Filename for an external template.
7. **elements**: Array of elements that define the content of the PDF.
8. **input**: Values provided by the user as criteria for PDF generation. (may be added in code)
9. **data**: Dynamic data form sources such as database queries or API calls. (may be added in code)

Example structure:

```json
{
  "fileName": "example.pdf",
  "pageOptions": {
    "height": 842,
    "width": 595,
    "marginTop": 20,
    "marginBottom": 20,
    "marginLeft": 20,
    "marginRight": 20,
    "templateUrl": "templateUrl",
    "pageOrientation": "portrait"
  },
  "styles": {
    "font": "Helvetica",
    "font-size": 12,
    "color": "#000000"
  },
  "variables": {
    "companyName": "Example Company",
    "date": "2023-07-24"
  },
  "template": {
    "name": "baseTemplate",
    "variables": {
      "footerText": "Page {{pageNum}} of {{totalPages}}"
    }
  },
  "elements": [
    {
      "type": "heading",
      "level": 1,
      "text": "Welcome to Example Company",
      "styles": {
        "font-size": 24,
        "font-weight": "bold",
        "color": "#333333"
      }
    },
    {
      "type": "paragraph",
      "text": "We are pleased to have you here.",
      "styles": {
        "font-size": 14,
        "color": "#666666"
      }
    }
  ]
}
```

In the following sections, each component will be discussed in detail, providing syntax, descriptions, and examples to illustrate their usage.

## Page Settings

The `pageOptions` section of the JSON configuration file defines the dimensions, margins, orientation, and template URL for the PDF document. These settings are crucial for determining the overall layout and structure of the PDF.

### Page Dimensions

The `PageDimensions` interface specifies the height and width of the PDF pages.

```typescript
interface PageDimensions {
  height: number;
  width: number;
}
```

Example:

```json
{
  "height": 842,
  "width": 595
}
```

### Page Margins

The `PageMargins` interface defines the margins around the content of each page.

```typescript
interface PageMargins {
  marginTop: number;
  marginBottom: number;
  marginLeft: number;
  marginRight: number;
}
```

Example:

```json
{
  "marginTop": 20,
  "marginBottom": 20,
  "marginLeft": 20,
  "marginRight": 20
}
```

### Page Options

The `PageOptions` interface combines `PageDimensions` and `PageMargins`, and adds optional attributes for template URL and page orientation.

```typescript
interface PageOptions extends PageDimensions, PageMargins {
  templateUrl?: string;
  pageOrientation?: "portrait" | "landscape";
}
```

- **templateUrl**: (Optional) URL of an external template to use for the PDF (which should consist of 1 page only).
- **pageOrientation**: (Optional) Orientation of the page, either `portrait` or `landscape` (this param ensure swaps height and width as fit).

Example:

```json
{
  "pageOptions": {
    "height": 842,
    "width": 595,
    "marginTop": 20,
    "marginBottom": 20,
    "marginLeft": 20,
    "marginRight": 20,
    "templateUrl": "http://example.com/template.pdf",
    "pageOrientation": "portrait"
  }
}
```

**Note:** default page options use the dimensions of A4 page and all margins are 50

### Full Example of Page Settings

Here is a complete example combining all aspects of page settings:

```json
{
  "fileName": "example.pdf",
  "pageOptions": {
    "height": 842,
    "width": 595,
    "marginTop": 20,
    "marginBottom": 20,
    "marginLeft": 20,
    "marginRight": 20,
    "templateUrl": "http://example.com/template.pdf",
    "pageOrientation": "portrait"
  }
}
```

In this example:

- The PDF page dimensions are set to a height of 842 units and a width of 595 units.
- Each page has a top, bottom, left, and right margin of 20 units.
- An external template located at `http://example.com/template.pdf` is used.
- The page orientation is set to `portrait`.

With the page settings defined, you can control the layout and appearance of the PDF pages, ensuring that your content fits within the specified dimensions and margins.

## Styles

The `styles` section of the JSON configuration file allows you to define and apply styles to various elements within the PDF document. Styles control the visual appearance of text, borders, colors, and positioning of elements.

### Style Object

The `Style` interface defines a comprehensive set of styling properties that can be applied to elements.

```typescript
interface Style {
  [key: string]: string | number | undefined;
  font?: "TimesRoman" | "Helvetica" | "Courier" | string;
  "font-size"?: number;
  "font-weight"?: "normal" | "bold";
  "text-decoration"?: "none" | "underline";
  color?: string;
  "background-color"?: string;
  margin?: number;
  "margin-top"?: number;
  "margin-right"?: number;
  "margin-bottom"?: number;
  "margin-left"?: number;
  padding?: number;
  "padding-top"?: number;
  "padding-right"?: number;
  "padding-bottom"?: number;
  "padding-left"?: number;
  border?: number;
  "border-color"?: string;
  "border-top"?: number;
  "border-right"?: number;
  "border-bottom"?: number;
  "border-left"?: number;
  "align-content-horizontally"?: "start" | "center" | "end";
  "align-content-vertically"?: "start" | "center" | "end";
  position?: "static" | "relative" | "fixed";
  top?: number;
  right?: number;
  bottom?: number;
  left?: number;
  width?: "max-width" | "fit-content";
  height?: "fit-content";
}
```

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

**Note:** To embed fonts you can use the following method of `ElementStyleCalculator`

```ts
  static async addFontFromUrl(options: {
    name: string;
    fontUrls: { normal: string; bold?: string };
  }): Promise<void>;
```

or from `PdfBuilder`

```ts
  async addFontFromUrl(options: {
    name: string;
    fontUrls: { normal: string; bold?: string };
    fromCssFile?: boolean;
  }): Promise<void>;
```

after adding a font it can be used for the whole session

**Note:** If used font cannot encode any character a custom 'Noto Sans' font is used as fallback (which is a combined english and arabic 'Noto Sans')

### Global Styles

Global styles are defined at the top level of the JSON configuration and apply to the body of the document, which contains all elements. These styles set the default appearance for the entire document.

Example:

```json
{
  "styles": {
    "font": "Helvetica",
    "font-size": 12,
    "color": "#000000",
    "margin": 10
  }
}
```

In this example:

- The global font is set to Helvetica.
- The default font size is 12.
- The default text color is black.
- A margin of 10 units is applied to the body of the document.

### Style Inheritance

Element-specific styles can override global styles, but they also inherit certain properties from the parent element's styles. The following styles are inherited from the parent element:

- `font`
- `font-size`
- `font-weight`
- `text-decoration`
- `color`

### Shorthand Styles

Shorthand styles such as `margin`, `padding`, and `border` are shorthand for other sub properties and can be overridden by more specific properties.

For example:

```json
{
  "styles": {
    "margin": 5,
    "margin-right": 0
  }
}
```

In this example:

- All margins are set to 5 units.
- The right margin is specifically set to 0 units.

The same principle applies to `padding` and `border` shorthand properties.

### Element-Specific Styles

Element-specific styles override the inherited and global styles for that particular element. These are defined within each element's `styles` attribute.

Example:

```json
{
  "elements": [
    {
      "type": "heading",
      "level": 1,
      "text": "Welcome to Example Company",
      "styles": {
        "font-size": 24,
        "font-weight": "bold",
        "color": "#333333"
      }
    },
    {
      "type": "paragraph",
      "text": "We are pleased to have you here.",
      "styles": {
        "font-size": 14,
        "color": "#666666"
      }
    }
  ]
}
```

In this example:

- The heading element has a font size of 24, bold font weight, and a color of #333333, overriding the global styles.
- The paragraph element has a font size of 14 and a color of #666666, overriding the global styles.

### Full Example with Styles

Here is a complete example combining global styles and element-specific styles:

```json
{
  "fileName": "example.pdf",
  "pageOptions": {
    "height": 842,
    "width": 595,
    "marginTop": 20,
    "marginBottom": 20,
    "marginLeft": 20,
    "marginRight": 20,
    "pageOrientation": "portrait"
  },
  "styles": {
    "font": "Helvetica",
    "font-size": 12,
    "color": "#000000",
    "margin": 10
  },
  "elements": [
    {
      "type": "heading",
      "level": 1,
      "text": "Welcome to Example Company",
      "styles": {
        "font-size": 24,
        "font-weight": "bold",
        "color": "#333333"
      }
    },
    {
      "type": "paragraph",
      "text": "We are pleased to have you here.",
      "styles": {
        "font-size": 14,
        "color": "#666666"
      }
    }
  ]
}
```

With these styles defined, the PDF will have a consistent appearance, while allowing for customization at the element level. The elements inherit the global styles unless explicitly overridden.

---

Next, we will move on to **Elements**, covering the different types of elements you can include in the PDF and their specific attributes.

## Elements

The `elements` section of the JSON configuration file defines the different types of content that will be included in the PDF document. Each element can have its own attributes and styles, and can be organized into containers or stand-alone items.

### Element Types

Each element in the `elements` array must specify its type and can include various attributes depending on the element type. The available element types are:

1. **Heading**
2. **Paragraph**
3. **Table**
4. **Object Table**
5. **Auto Table**
6. **Horizontal Container**
7. **Vertical Container**

### 1. Heading

The `Heading` element represents a header or title in the PDF. It is used to display headings with different levels of emphasis.

**Attributes:**

- `type` (required): Set to `'heading'` or `'h'`.
- `level` (required): Numeric value indicating the heading level (e.g., 1 for the main heading, 2 for subheading, etc).
- `text` (required): The text content of the heading.
- `styles` (optional): Styles to apply specifically to this heading.

**Note:** the `level` attribute is used to calculate font size if `font-size` not specified in styles.

**Example:**

```json
{
  "type": "heading",
  "level": 1,
  "text": "Welcome to Example Company",
  "styles": {
    "font-size": 24,
    "font-weight": "bold",
    "color": "#333333"
  }
}
```

### 2. Paragraph

The `Paragraph` element represents a block of text. It is used to display textual content in the PDF.

**Attributes:**

- `type` (required): Set to `'paragraph'` or `'p'`.
- `text` (required): The text content of the paragraph.
- `styles` (optional): Styles to apply specifically to this paragraph.

**Example:**

```json
{
  "type": "paragraph",
  "text": "We are pleased to have you here.",
  "styles": {
    "font-size": 14,
    "color": "#666666"
  }
}
```

### 3. Table

The `Table` element represents a tabular data structure. It allows you to organize data into rows and columns.

**Attributes:**

- `type` (required): Set to `'table'` or `'t'`.
- `data` (required): A 2D array of `TableCell` objects, where each cell contains text and optional styles.
- `cellStyles` (optional): Styles to apply to all table cells.
- `rowStyles` (optional): Styles to apply to rows, based on special selection criteria.
- `columnStyles` (optional): Styles to apply to columns, based on special selection criteria.
- `columnsRatio` (optional): An array defining the relative width of each column.

**Example:**

```json
{
  "type": "table",
  "data": [
    [{ "text": "Name" }, { "text": "Age" }],
    [{ "text": "Alice" }, { "text": "30" }],
    [{ "text": "Bob" }, { "text": "25" }]
  ],
  "cellStyles": {
    "border": 1,
    "border-color": "#CCCCCC"
  },
  "rowStyles": {
    "odd": {
      "background-color": "#F0F0F0"
    }
  }
}
```

### 4. Object Table

The `Object Table` element represents a tabular structure where the data is in the form of an object or an array of objects. It provides more flexibility in how data is presented.

**Attributes:**

- `type` (required): Set to `'object-table'`, `'o-table'`, or `'obj-table'`.
- `data` (required): An array of `DataRecord` objects or a single `DataRecord` object.
- `headersPlacement` (optional): Defines where headers are placed ('row' or 'column').
- `hideHeaders` (optional): Boolean value to hide the headers.
- `headerStyles` (optional): Styles for table headers.
- `cellStyles` (optional): Styles for table cells.
- `rowStyles` (optional): Styles for rows, based on special selection criteria (of type `ChildrenStylesSelectors` as explained in the next section).
- `columnStyles` (optional): Styles for columns, based on special selection criteria (of type `ChildrenStylesSelectors` as explained in the next section).
- `columnsRatio` (optional): An array defining the relative width 'weight' of each column.

**Example:**

```json
{
  "type": "object-table",
  "data": [
    { "name": "Alice", "age": 30 },
    { "name": "Bob", "age": 25 }
  ],
  "headersPlacement": "row",
  "headerStyles": {
    "font-weight": "bold",
    "background-color": "#DDDDDD"
  },
  "cellStyles": {
    "border": 1,
    "border-color": "#CCCCCC"
  }
}
```

### 5. Auto Table

The `Auto Table` element is used for dynamically generated tables based on a schema. It automatically handles dynamic data filling using special variables (explained in detail in the next section).

**Attributes:**

- `type` (required): Set to `'auto-table'` or `'a-table'`.
- `schema` (required): A record mapping headers to data field keys.
- `tableDataKey` (required if data is of type `MultiDataRecords`): Key to determine which array of data to use when data is a `MultiDataRecords`.
- `headersPlacement` (optional): Defines where headers are placed ('row' or 'column').
- `hideHeaders` (optional): Boolean value to hide the headers.
- `headerStyles` (optional): Styles for table headers.
- `cellStyles` (optional): Styles for table cells.
- `rowStyles` (optional): Styles for rows, based on special selection criteria (of type `ChildrenStylesSelectors` as explained in the next section).
- `columnStyles` (optional): Styles for columns, based on special selection criteria (of type `ChildrenStylesSelectors` as explained in the next section).
- `columnsRatio` (optional): An array defining the relative width 'weight' of each column.

**Example:**

```json
{
  "type": "auto-table",
  "schema": {
    "Name": "row.name",
    "Age": "row.age"
  },
  "tableDataKey": "users",
  "headerStyles": {
    "font-weight": "bold",
    "background-color": "#DDDDDD"
  },
  "cellStyles": {
    "border": 1,
    "border-color": "#CCCCCC"
  }
}
```

### 6. Horizontal Container

The `Horizontal Container` element organizes other elements horizontally, allowing for flexible layouts.

**Attributes:**

- `type` (required): Set to `'horizontal-container'` or `'h-container'`.
- `widths` (required): An array of `MaxWidth` values defining the width of each child element.
- `elements` (required): An array of child `ElementJson` objects to be contained.

**Example:**

```json
{
  "type": "horizontal-container",
  "widths": ["50%", "50%"],
  "elements": [
    {
      "type": "heading",
      "level": 2,
      "text": "Left Section"
    },
    {
      "type": "paragraph",
      "text": "Right Section"
    }
  ]
}
```

**Note:** Valid values for `MaxWidth` could be:

- `"100"`: A number string
- `"50%"`: A percentage string
- `"75%+10"`: A number percentage string with a plus sign
- `"30%-5"`: A number percentage string with a minus sign
- `"20+80%"`: A number percentage string with a percent sign at the end

### 7. Vertical Container

The `Vertical Container` element organizes other elements vertically.

**Attributes:**

- `type` (required): Set to `'vertical-container'` or `'v-container'`.
- `elements` (required): An array of child `ElementJson` objects to be contained.

**Example:**

```json
{
  "type": "vertical-container",
  "elements": [
    {
      "type": "heading",
      "level": 1,
      "text": "Main Heading"
    },
    {
      "type": "paragraph",
      "text": "This is a paragraph."
    }
  ]
}
```

### Full Example

Here is a complete example combining different element types:

```json
{
  "fileName": "example.pdf",
  "pageOptions": {
    "height": 842,
    "width": 595,
    "marginTop": 20,
    "marginBottom": 20,
    "marginLeft": 20,
    "marginRight": 20,
    "pageOrientation": "portrait"
  },
  "styles": {
    "font": "Helvetica",
    "font-size": 12,
    "color": "#000000",
    "margin": 10
  },
  "elements": [
    {
      "type": "heading",
      "level": 1,
      "text": "Welcome to Example Company",
      "styles": {
        "font-size": 24,
        "font-weight": "bold",
        "color": "#333333"
      }
    },
    {
      "type": "paragraph",
      "text": "We are pleased to have you here.",
      "styles": {
        "font-size": 14,
        "color": "#666666"
      }
    },
    {
      "type": "table",
      "data": [
        [{ "text": "Name" }, { "text": "Age" }],
        [{ "text": "Alice" }, { "text": "30" }],
        [{ "text": "Bob" }, { "text": "25" }]
      ],
      "cellStyles": {
        "border": 1,
        "border-color": "#CCCCCC"
      }
    },
    {
      "type": "horizontal-container",
      "widths": ["50%", "50%"],
      "elements": [
        {
          "type": "heading",
          "level": 2,
          "text": "Left Section"
        },
        {
          "type": "paragraph",
          "text": "Right Section"
        }
      ]
    }
  ]
}
```

This example demonstrates how to use various element types and styles to create a structured PDF document.

## Children Styles Selectors

**Children Styles Selectors** provide a way to apply specific styles to child elements within containers based on selection criteria such as odd/even positioning or specific child numbers. This is particularly useful for dynamically styling elements like rows in tables or items in lists.

**Note:** For now it's only implemented on object and auto tables rows' and columns'

### **Definition**

`ChildrenStylesSelectors` is a type that allows to apply styles on children based a specific selector criterion. Each criterion maps to a `Style` object that defines the styling to be applied. (if multiple where specified the more specific overrides the less specific)

```typescript
export type ChildrenStylesSelectors = Partial<Record<`${number}` | "odd" | "even" | "first" | "last", Style>>;
```

### **Selectors**

1. **Numeric Index (`${number}`)**

   - **Description**: Targets a specific child element by its index. Indexing starts from `1`.
   - **Example**: `1`, `2`, `3` - These would apply styles to the first, second, and third child elements respectively.

2. **Odd**

   - **Description**: Targets child elements with odd indices (1st, 3rd, 5th, etc.).
   - **Example**:
     ```json
     {
       "odd": {
         "background-color": "#f9f9f9"
       }
     }
     ```
   - **Usage**: Styles every odd-numbered element with a light gray background.

3. **Even**

   - **Description**: Targets child elements with even indices (2nd, 4th, 6th, etc.).
   - **Example**:
     ```json
     {
       "even": {
         "background-color": "#FFFFFF"
       }
     }
     ```
   - **Usage**: Styles every even-numbered element with a white background.

4. **First**

   - **Description**: Targets the first child element.
   - **Example**:
     ```json
     {
       "first": {
         "font-weight": "bold"
       }
     }
     ```
   - **Usage**: Applies bold font weight to the first child element.

5. **Last**
   - **Description**: Targets the last child element.
   - **Example**:
     ```json
     {
       "last": {
         "border-bottom": 2
       }
     }
     ```
   - **Usage**: Adds a border to the bottom of the last child element.

### **Examples**

- **Table Row Styling**

  Suppose you have a table where you want to style alternating rows differently and add a specific style to the first and last row. Here's how you might configure `ChildrenStylesSelectors` for that:

  ```json
  {
    "rowStyles": {
      "odd": {
        "background-color": "#f9f9f9"
      },
      "even": {
        "background-color": "#ffffff"
      },
      "first": {
        "font-weight": "bold"
      },
      "last": {
        "border-bottom": 3
      }
    }
  }
  ```

  In this example:

  - Odd rows have a light gray background.
  - Even rows have a white background.
  - The first row has bold font weight.
  - The last row has a border at the bottom.

### **Usage**

To use `ChildrenStylesSelectors`, include it in the `rowStyles`, `columnStyles`, or any similar property where you want to apply conditional styling to child elements.

By leveraging `ChildrenStylesSelectors`, you can apply sophisticated and dynamic styles to various parts of your PDF content, enhancing both visual appeal and readability.

Next, we will cover **Variables** and how to use them in conjunction with the elements to generate dynamic content in the PDF.

## Variables and Pipes

### Introduction

The `variables` section of the JSON configuration allows you to define dynamic content and placeholders that can be resolved and replaced with actual values when generating the PDF. This section supports various scopes and provides flexibility in how data is injected into the PDF document.

### Variable Syntax

Placeholders in text are defined using double curly braces `{{ }}` and can include variable names, pipes, and arguments for formatting.

**Basic Syntax:**

- **Variable Only:** `{{variableName}}`
- **Variable with Pipe:** `{{variableName|pipeName:args}}`

**Examples:**

- `{{price}}` - Directly replaces `{{price}}` with the value of `price`.
- `{{price|number:1.2-4}}` - Replaces `{{price}}` with the formatted number according to the specified format.

### Variable Scopes

#### Global Variables

Global variables are available for use in element text content. They include:

1. **PDF JSON Variables:**
   - Defined in the `variables` attribute of the `pdfJson` object.
2. **Template Variables:**
   - Variables inherited from the template JSON document, specified in the `variables` attribute of the `template` or `templateFileName` attributes.
3. **Additional Variables:**
   - Provided via the `additionalVariables` parameter in the `parsePdfJson` or `parseFromFile` functions.
4. **Special Variable:**
   - `date`: Represents the current date (today).

**Example:**

```json
{
  "variables": {
    "companyName": "Example Company",
    "address": "1234 Example Street"
  }
}
```

```json
{
  "type": "paragraph",
  "text": "Company Name: {{companyName}}\nDate: {{date}}"
}
```

In this example:

- `companyName` and `address` are global variables that can be used in element text.
- `date` will be replaced with the current date.

#### Input Variables

Input variables are provided by the user as criteria for PDF generation. They are prefixed with `input.` and are available in element text.

**Note:** Input variables may be provided in code and added to `pdfJson` dynamically.

**Format:**

```json
{
  "input": {
    "customerName": "John Doe",
    "orderNumber": "12345"
  }
}
```

**Usage in Text:**

```json
{
  "type": "paragraph",
  "text": "Customer: {{input.customerName}}, Order Number: {{input.orderNumber}}"
}
```

In this example:

- `{{input.customerName}}` and `{{input.orderNumber}}` will be replaced with "John Doe" and "12345", respectively.

#### Data Variables

Data variables come from dynamic data sources such as database queries or API calls.

**Note:** Data variables may be provided in code and added to `pdfJson` dynamically.

They can be provided in two formats:

1. **Single Array:**
   - When data originates from one source, provided as an array of `DataRecord` objects.

**Format:**

```json
{
  "data": [
    { "item": "Widget", "quantity": 10, "price": 9.99 },
    { "item": "Gadget", "quantity": 5, "price": 19.99 }
  ]
}
```

**Usage in Text:**

```json
{
  "type": "paragraph",
  "text": "Item: {{data.1.item}}, Quantity: {{data.1.quantity}}, Price: {{data.1.price}}"
}
```

In this example:

- `{{data.1.item}}`, `{{data.1.quantity}}`, and `{{data.1.price}}` will be replaced with the values from the _second_ item in the data array.

**Note:** For data variables, the item at index zero can be accessed without adding `.0` (e.g., `{{data.item}}` instead of `{{data.0.item}}`).

**Note:** The following is the definition of `DataRecord`:

```typescript
type DataRecord = Record<string, string | number | null | undefined>;
```

2. **Multiple Arrays:**
   - When data comes from multiple sources, provided as `MultiDataRecords`, where each key represents a different data source.

**Format:**

```json
{
  "data": {
    "orders": [
      { "item": "Widget", "quantity": 10, "price": 9.99 },
      { "item": "Gadget", "quantity": 5, "price": 19.99 }
    ],
    "customers": [{ "name": "John Doe", "email": "john@example.com" }]
  }
}
```

**Usage in Text:**

```json
{
  "type": "paragraph",
  "text": "Customer: {{data.customers.0.name}}, Item: {{data.orders.item}}, Quantity: {{data.orders.quantity}}, Price: {{data.orders.price}}"
}
```

In this example:

- `{{data.customers.0.name}}` and `{{data.orders.item}}`, `{{data.orders.quantity}}`, and `{{data.orders.price}}` will be replaced with the respective values from the multiple data arrays.

**Note:** The following is the definition of `MultiDataRecords`:

```typescript
type MultiDataRecords = Record<string, DataRecord[]>;
```

#### Template-Specific Variables

Template-specific variables are available only within the context of the template and include:

- `pageNum`: Represents the current page number.
- `totalPages`: Represents the total number of pages in the document.

**Example:**

`example.template.json:`

```json
{
  "variables": {
    "pageNum": "1",
    "totalPages": "10"
  },
  "elements": [
    {
      "type": "paragraph",
      "text": "Page {{pageNum}} of {{totalPages}}"
    }
  ]
}
```

In this example:

- `{{pageNum}}` and `{{totalPages}}` will be replaced with the current page number and total pages count, respectively.

#### AutoTable-Specific Variables

AutoTable-specific variables are used in the schema of an Auto Table:

- `serialNumber`: Represents the row number.
- `row.{dataKeyName}`: Represents the data provided in the row.

**Format:**

```json
{
  "data": {
    "orders": [
      { "item": "Widget", "quantity": 10, "price": 9.99 },
      { "item": "Gadget", "quantity": 5, "price": 19.99 }
    ],
    "customers": [{ "name": "John Doe", "email": "john@example.com" }]
  }
}
```

```json
{
  "type": "auto-table",
  "schema": {
    "Serial Number": "serialNumber",
    "Item": "row.item",
    "Quantity": "row.quantity",
    "Price": "row.price"
  },
  "tableDataKey": "orders"
}
```

In this example:

- `{{serialNumber}}`, `{{row.item}}`, `{{row.quantity}}`, and `{{row.price}}` will be replaced with the respective values in the Auto Table.

### Pipes

Pipes are used with variables to format values dynamically. They allow you to apply specific formatting rules, such as number formatting or date formatting. Custom pipes can also be used for more complex transformations.

#### Default Pipes

Default pipes handle common formatting needs:

1. **Number Pipe**

   - **Description:** Formats a number based on the specified format.
   - **Format:** `{{variableName|number:format}}`
   - **Example:** `{{price|number:1.2-4}}`
     - `variableName`: Should be a number.
     - `format`: Specifies the number format:
       - `1`: Minimum integer digits.
       - `2`: Minimum fraction digits.
       - `4`: Maximum fraction digits.

   **Example Usage:**

   ```json
   {
     "variables": {
       "price": 1234.5678
     },
     "text": "The price is {{price|number:1.2-4}}."
   }
   ```

   **Result:** "The price is 1,234.57."

2. **Date Pipe**

   - **Description:** Formats a date string based on the specified format.
   - **Format:** `{{variableName|date:format}}`
   - **Example:** `{{date|date:dd/MM/yyyy}}`
     - `variableName`: Should be a date string.
     - `format`: Specifies the date format:
       - `yyyy`: Year
       - `MM`: Month
       - `dd`: Day
       - `HH`:

Hour - `mm`: Minute - `ss`: Second

**Example Usage:**

```json
{
  "variables": {
    "currentDate": "2023-07-24T12:34:56"
  },
  "text": "The current date is {{currentDate|date:dd/MM/yyyy}}."
}
```

**Result:** "The current date is 24/07/2023."

#### Custom Pipes

Custom pipes allow you to define specific formatting rules tailored to your needs.

#### Pipe Registration

Custom pipes can be registered in the system using a specific format:

**Example Custom Pipe Registration:**

```typescript
PdfVariableResolver.registerPipe("uppercase", (value: string) => value.toUpperCase());
```

In this example:

- The custom pipe `uppercase` transforms the text to uppercase.

#### Example of Custom Pipe

Once registered, custom pipes can be used in the same way as default pipes.

**Example Usage:**

```json
{
  "variables": {
    "greeting": "hello world"
  },
  "text": "{{greeting|uppercase}}"
}
```

**Result:** "HELLO WORLD"

### Full Example

Combining the explained concepts into a single example:

**PDF Configuration:**

```json
{
  "variables": {
    "companyName": "Example Company",
    "address": "1234 Example Street",
    "price": 1234.5678,
    "currentDate": "2023-07-24T12:34:56"
  },
  "input": {
    "customerName": "John Doe",
    "orderNumber": "12345"
  },
  "data": [
    { "item": "Widget", "quantity": 10, "price": 9.99 },
    { "item": "Gadget", "quantity": 5, "price": 19.99 }
  ],
  "elements": [
    {
      "type": "paragraph",
      "text": "Company: {{companyName}}\nAddress: {{address}}\nDate: {{currentDate|date:dd/MM/yyyy}}\nPrice: {{price|number:1.2-4}}"
    },
    {
      "type": "paragraph",
      "text": "Customer: {{input.customerName}}\nOrder Number: {{input.orderNumber}}"
    },
    {
      "type": "auto-table",
      "schema": {
        "Serial Number": "serialNumber",
        "Item": "row.item",
        "Quantity": "row.quantity",
        "Price": "row.price"
      },
      "tableDataKey": "data"
    }
  ]
}
```

**Resulting PDF Content:**

```
Company: Example Company
Address: 1234 Example Street
Date: 24/07/2023
Price: 1,234.57

Customer: John Doe
Order Number: 12345

| Serial Number | Item   | Quantity | Price |
|---------------|--------|----------|-------|
| 1             | Widget | 10       | 9.99  |
| 2             | Gadget | 5        | 19.99 |
```

In this example, we demonstrate the use of various types of variables and pipes to generate a dynamic PDF document.

### Summary

Variables and pipes provide powerful tools for generating dynamic and formatted content in PDF documents. By understanding and utilizing global variables, input variables, data variables, and the various formatting pipes, you can create highly customizable and professional-looking PDFs tailored to your specific needs.

## Templates

Templates in the JSON configuration provide a way to define reusable content and structure for your PDFs. They allow you to specify common elements and styles that can be applied across multiple pages or documents, ensuring consistency and reducing duplication.

### **Definition**

A template is defined using the `PdfJsonTemplate` interface. It includes attributes for page margins, page options, styles, variables, and elements. Templates are particularly useful for defining recurring elements like headers, footers, or standardized sections.

```typescript
export interface PdfJsonTemplate {
  name?: string;
  pageMargins?: Partial<PageMargins>;
  pageOptions?: Partial<PageOptions>;
  styles?: Style;
  variables?: ComplexDataRecord;
  elements?: ElementJson[];
}
```

### **Attributes**

1. **`name` (optional)**

   - **Description**: A unique name for the template. Useful for identifying or referencing the template.
   - **Example**:
     ```json
     {
       "name": "StandardTemplate"
     }
     ```

2. **`pageMargins` (optional)**

   - **Description**: Defines the margins for the pages using `PageMargins` attributes. This controls the space between the content and the edges of the page.
   - **Example**:
     ```json
     {
       "pageMargins": {
         "marginTop": 20,
         "marginBottom": 20,
         "marginLeft": 15,
         "marginRight": 15
       }
     }
     ```

3. **`pageOptions` (optional)**

   - **Description**: Specifies additional page options such as dimensions and orientation using `PageOptions`.
   - **Example**:
     ```json
     {
       "pageOptions": {
         "height": 297,
         "width": 210,
         "pageOrientation": "portrait"
       }
     }
     ```

4. **`styles` (optional)**

   - **Description**: Defines default styles that can be applied to elements within the template. Styles are specified using the `Style` interface.
   - **Example**:
     ```json
     {
       "styles": {
         "font": "Helvetica",
         "font-size": 12,
         "color": "#333333"
       }
     }
     ```

5. **`variables` (optional)**

   - **Description**: Specifies variables that are available within the template. This can include global variables as well as any template-specific variables.
   - **Example**:
     ```json
     {
       "variables": {
         "companyName": "MyCompany",
         "date": "{{date}}"
       }
     }
     ```

6. **`elements` (optional)**
   - **Description**: Defines the elements that will be included in the template. Elements are defined using the `ElementJson` type and can include headings, paragraphs, tables, and containers.
   - **Example**:
     ```json
     {
       "elements": [
         {
           "type": "heading",
           "level": 1,
           "text": "Report Title"
         },
         {
           "type": "paragraph",
           "text": "This is a sample paragraph."
         },
         {
           "type": "table",
           "data": [
             [{ "text": "Header 1" }, { "text": "Header 2" }],
             [{ "text": "Row 1, Cell 1" }, { "text": "Row 1, Cell 2" }]
           ]
         }
       ]
     }
     ```

### **Example of a Complete Template Configuration**

Here’s a comprehensive example of a JSON configuration for a template:

```json
{
  "name": "InvoiceTemplate",
  "pageMargins": {
    "marginTop": 25,
    "marginBottom": 25,
    "marginLeft": 20,
    "marginRight": 20
  },
  "pageOptions": {
    "height": 297,
    "width": 210,
    "pageOrientation": "portrait"
  },
  "styles": {
    "font": "TimesRoman",
    "font-size": 12,
    "color": "#000000"
  },
  "variables": {
    "companyName": "Acme Corp",
    "invoiceNumber": "INV-001",
    "date": "{{date}}"
  },
  "elements": [
    {
      "type": "heading",
      "level": 1,
      "text": "Invoice"
    },
    {
      "type": "paragraph",
      "text": "Company: {{companyName}}"
    },
    {
      "type": "paragraph",
      "text": "Invoice Number: {{invoiceNumber}}"
    },
    {
      "type": "table",
      "data": [
        [{ "text": "Item" }, { "text": "Quantity" }, { "text": "Price" }],
        [{ "text": "Widget" }, { "text": "10" }, { "text": "$100" }]
      ]
    },
    {
      "type": "paragraph",
      "text": "Date: {{date}}"
    }
  ]
}
```

### **Usage**

Templates can be used in `pdfJson` to standardize content across multiple PDFs. When generating a PDF, you can specify a template to ensure that common elements and styles are consistently applied.

- **In `pdfJson`**:
  ```json
  {
    "fileName": "Invoice.pdf",
    "templateFileName": "InvoiceTemplate",
    "elements": [
      // Additional elements can be specified here
    ]
  }
  ```

This setup ensures that the PDF follows the structure and style defined in the template, while still allowing for specific elements and data to be customized as needed.
