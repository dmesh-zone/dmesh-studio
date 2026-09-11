# Custom Dependency Management

DMesh Studio's customization system allows peer repositories to inject third-party NPM libraries dynamically. This is useful when you are building completely custom React components or pages that rely on external packages not included in the core `dmesh-studio` build (for instance, graphing libraries like `recharts` or utility libraries like `lodash`).

## How it works

The `customization.py` script automatically manages NPM dependencies defined by your custom repository.

When you apply a customization (e.g., `python3 customization.py sample`), the script looks for a `dependencies.json` file in the root of the custom repository. If it finds one, it will automatically install those dependencies into the `dmesh-studio` environment.

When you disable customizations (`python3 customization.py off`), the script safely uninstalls any packages it previously injected, keeping the core `package.json` pristine.

## Defining Dependencies

To add dependencies to your custom repository, create a `dependencies.json` file in its root folder (e.g., `/dmesh-studio-custom-sample/dependencies.json`). 

The file must follow standard NPM JSON syntax for dependencies:

```json
{
  "dependencies": {
    "recharts": "^2.10.3",
    "lodash": "^4.17.21"
  }
}
```

## Using the Dependencies

Once defined, you can import and use these libraries directly in your custom React components (`src/pages/custom/.../index.jsx`):

```javascript
import React from 'react';
import { LineChart, Line } from 'recharts';
import _ from 'lodash';

export default function MyCustomPage() {
    // Your custom implementation
    return <div>Hello Custom World!</div>;
}
```

Vite will seamlessly bundle these dependencies during development and production builds, exactly as if they were natively installed in the project.
