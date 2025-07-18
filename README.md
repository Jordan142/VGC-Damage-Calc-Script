# VGC Damage Calc Generator

> Produces a list of damage calcs when two Pokepastes are added, accounting for tera if requested.

## Table of Contents

- [VGC Damage Calc Generator](#vgc-damage-calc-generator)
  - [Table of Contents](#table-of-contents)
  - [Requirements](#requirements)
  - [Installation](#installation)
  - [Usage](#usage)
  - [Contributing](#contributing)
  - [Special Thanks](#special-thanks)

## Requirements

Before running this project, ensure you have the following installed:

- [Node.js](https://nodejs.org/) v22.16 or later
- [npm](https://www.npmjs.com/) v10.9.2 or later (comes with Node.js)

Earlier versions of Node.js and npm may work with but are untested

## Installation

Clone the repository and install dependencies:

```bash
git clone https://github.com/Jordan142/VGC-Damage-Calc-Script.git
cd VGC-Damage-Calc-Script
npm install
```

If you don't have git installed, download the .zip file in the desired location then open up command prompt, cd to the VGC-Damage-Calc-Script and then run npm install.

## Usage

Open command prompt or the terminal of your choice in the VGC-Damage-Calc-Script folder.

```node
node vgcDamageCalcScript.js
```
Then follow the prompts that appear in the terminal.
This requires two pokepastes to run.

## Contributing

Testing
- Jamie Chen

## Special Thanks

- Bauerdad for creating PASRS which I modified the TEAMDATAFROMPASTE formula for convertSDPaste.js (and should probably clean up irrelevant code in it)