# 💎 Gem Guesser - Deluxe Edition

A captivating logic puzzle game where you deduce the positions of hidden gems using color clues. Think of it as a colorful twist on Minesweeper!

[![Deploy to GitHub Pages](https://github.com/yourusername/GemGuesser/actions/workflows/deploy.yml/badge.svg)](https://github.com/yourusername/GemGuesser/actions/workflows/deploy.yml)

## 🎮 Play Now

**[Play Gem Guesser](https://yourusername.github.io/GemGuesser/)**

## 🎯 How to Play

1. **Choose Your Difficulty**
   - **Easy**: 80% of the grid contains gems
   - **Medium**: 65% of the grid contains gems
   - **Hard**: 50% of the grid contains gems

2. **Use the Clues**
   - Numbers on the **top** show how many gems of each color are in that column
   - Numbers on the **left** show how many gems of each color are in that row
   - The **right panel** shows the total count for each gem color

3. **Make Your Guesses**
   - Select a color from the right panel
   - Click on a cell to mark it as that color
   - Right-click to place a "ghost mark" (tentative guess)
   - You have **3 lives** ❤️ - lose one for each wrong guess

4. **Win the Game**
   - Correctly identify all gem positions
   - Enjoy the fireworks celebration! 🎆

## ✨ Features

- **Three Difficulty Levels**: From casual to challenging
- **Beautiful UI**: Smooth animations and particle effects
- **Lives System**: Visual heart indicator with liquid fill
- **Ghost Marks**: Mark uncertain cells with semi-transparent colors
- **Responsive Design**: Works on desktop and mobile
- **Victory Celebration**: Fireworks display when you win

## 🛠️ Technologies Used

- Pure HTML5, CSS3, and JavaScript
- No frameworks or dependencies (except fireworks-js for celebrations)
- Responsive grid layout
- CSS animations and transitions
- SVG graphics for the heart indicator

## 🚀 Local Development

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/GemGuesser.git
   cd GemGuesser
   ```

2. Open `src/index.html` in your browser or use a local server:
   ```bash
   # Using Python 3
   cd src
   python -m http.server 8000
   
   # Using Node.js http-server
   npx http-server src -p 8000
   ```

3. Navigate to `http://localhost:8000`

## 📁 Project Structure

```
GemGuesser/
├── src/
│   ├── index.html      # Main HTML file
│   ├── script.js       # Game logic
│   └── style.css       # Styling and animations
├── .github/
│   └── workflows/
│       └── deploy.yml  # GitHub Pages deployment
├── README.md
└── LICENSE
```

## 🎨 Game Design

- **Colors**: Red, Blue, Green, Purple, Orange gems
- **Grid Size**: 8x8 (64 cells)
- **Smart Clue System**: Row and column counters help you deduce positions
- **Progressive Difficulty**: Fewer gems = harder puzzles

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🤝 Contributing

Contributions are welcome! Feel free to:
- Report bugs
- Suggest new features
- Submit pull requests

## 👨‍💻 Author

Created with ❤️ for puzzle game enthusiasts

---

**Enjoy the game and happy gem hunting!** 💎✨