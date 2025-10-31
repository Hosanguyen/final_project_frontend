// Code templates for different programming languages
export const codeTemplates = {
    python: `# Python Solution
def solve():
    # Write your code here
    pass

if __name__ == "__main__":
    solve()
`,
    
    cpp: `#include <iostream>
#include <vector>
#include <string>
using namespace std;

int main() {
    // Write your code here
    
    return 0;
}
`,
    
    c: `#include <stdio.h>
#include <stdlib.h>
#include <string.h>

int main() {
    // Write your code here
    
    return 0;
}
`,
    
    java: `import java.util.*;
import java.io.*;

public class Solution {
    public static void main(String[] args) {
        // Write your code here
        
    }
}
`,
    
    javascript: `// JavaScript Solution
function solve() {
    // Write your code here
    
}

solve();
`,
    
    typescript: `// TypeScript Solution
function solve(): void {
    // Write your code here
    
}

solve();
`,
    
    csharp: `using System;
using System.Collections.Generic;
using System.Linq;

class Solution {
    static void Main(string[] args) {
        // Write your code here
        
    }
}
`,
    
    php: `<?php
// PHP Solution

function solve() {
    // Write your code here
    
}

solve();
?>
`,
    
    ruby: `# Ruby Solution
def solve
    # Write your code here
    
end

solve()
`,
    
    go: `package main

import (
    "fmt"
)

func main() {
    // Write your code here
    
}
`,
    
    rust: `// Rust Solution
fn main() {
    // Write your code here
    
}
`,
    
    swift: `// Swift Solution
import Foundation

func solve() {
    // Write your code here
    
}

solve()
`,
    
    kotlin: `// Kotlin Solution
fun main() {
    // Write your code here
    
}
`,
};

// Get template by language code
export const getTemplate = (languageCode) => {
    const code = languageCode?.toLowerCase();
    
    // Map common variations
    const map = {
        'py': 'python',
        'py3': 'python',
        'python3': 'python',
        'c++': 'cpp',
        'js': 'javascript',
        'ts': 'typescript',
        'cs': 'csharp',
        'rb': 'ruby',
    };
    
    const normalizedCode = map[code] || code;
    return codeTemplates[normalizedCode] || `// ${languageCode} Solution\n\n`;
};

// Language display names
export const languageNames = {
    python: 'Python',
    cpp: 'C++',
    c: 'C',
    java: 'Java',
    javascript: 'JavaScript',
    typescript: 'TypeScript',
    csharp: 'C#',
    php: 'PHP',
    ruby: 'Ruby',
    go: 'Go',
    rust: 'Rust',
    swift: 'Swift',
    kotlin: 'Kotlin',
};

// Language icons/colors
export const languageStyles = {
    python: { color: '#3776ab', icon: '🐍' },
    cpp: { color: '#00599c', icon: '⚡' },
    c: { color: '#555555', icon: '©️' },
    java: { color: '#007396', icon: '☕' },
    javascript: { color: '#f7df1e', icon: '📜' },
    typescript: { color: '#3178c6', icon: '📘' },
    csharp: { color: '#239120', icon: '#️⃣' },
    php: { color: '#777bb4', icon: '🐘' },
    ruby: { color: '#cc342d', icon: '💎' },
    go: { color: '#00add8', icon: '🐹' },
    rust: { color: '#000000', icon: '🦀' },
    swift: { color: '#ffac45', icon: '🦅' },
    kotlin: { color: '#7f52ff', icon: '🅺' },
};
