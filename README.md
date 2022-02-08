# Bulma Option Menu
Create interactable lists to select options.  
Press the plus (+) button in the options on the left to select it, and press the minus (-) button in the options on the right to deselect it.

## Usage
_Make sure to include Bulma's CSS and Font Awesome to make sure it works properly_
``` HTML
...
<head>
    ...
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bulma@0.9.3/css/bulma.min.css">
    ...
</head>
<body>
    ...
    <!-- Font Awesome Kit -->
    <script src="https://kit.fontawesome.com/Your-Kit-Name.js" crossorigin="anonymous"></script>
    <script src="https://cdn.jsdelivr.net/npm/@levinelito/bulma-option-list"></script>
    ...
</body>
...
```

### Using input to contain the data
``` javascript
const OptionMenu = new OptionMenu.List({
    target: 'input',
    data: {added: ['Option A', 'Option B', 'Option C'], available: ['Option D', 'Option E', 'Option F', 'Option G']},
});
```