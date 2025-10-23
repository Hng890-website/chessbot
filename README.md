Find a world chess with mychess.org! - This is just a test. Uncomplete, but I'm sure it's completed soon.
This document outlines the features, architecture, and recent significant enhancements of the Chess Bot application. This project is a single-page web application designed to allow users to engage in a fully functional game of chess against a competitive Bot AI. The core objective of the latest version was to significantly improve the user experience (UX) through a major layout overhaul and the introduction of advanced, user-friendly game analysis tools. The foundation of the Chess Bot lies in its logic and AI capability. The game state is managed robustly using the chess.js library, ensuring adherence to standard chess rules, including complex moves like castling and en passant.

The opposing player is a computer opponent powered by the Negamax search algorithm. Users can customize the opponent's strength by selecting a level between 1 and 10, which corresponds to the AI's search depth, offering a progressively challenging experience.

A notable update to the mechanics involves flexible pawn promotion. Instead of being limited to promoting to a Queen, the player is now explicitly prompted to choose between a Queen, Rook, Bishop, or Knight, ensuring full compliance with official chess rules.


The most crucial change in this version is the dramatic restructuring of the play-screen layout, shifting from a simple sidebar approach to a more professional, two-column grid system tailored for analysis:

Primary Column (Left): This section is dedicated to the Chessboard and the Move Analysis Panel. The new panel, situated immediately to the right of the board, displays the game's history using Standard Algebraic Notation (SAN), allowing players to track the match flow easily without visual disruption.

Secondary Column (Right): This consolidated area houses supplementary information: the Time and Metrics (timers, increment, and total time) and the Chat Room.

This redesign prioritizes immediate access to game state and move history, mimicking the layout often seen in professional online chess platforms.


The application features sophisticated time control and streamlined communication:

Flexible Time Control: Users can select standard time controls (e.g., Blitz 5+0, Rapid 10+0), set a custom time limit, or opt for an unlimited game. The logic includes time increment handling and automatically checks for time-out conditions.

Streamlined Chat Experience: To ensure a focused environment, system-generated messages detailing the Bot's internal thought process ("I am thinking...") or move confirmation ("I played Nc6.") have been completely removed from the Chat Room. This makes the Chat area cleaner and reserves it solely for meaningful player-to-Bot interaction or critical game state announcements (e.g., checkmate or draw).

Conclusion
The Advanced Chess Bot Application successfully integrates a powerful AI engine with a modern, analytical user interface. The combination of the Negamax algorithm, flexible time controls, and the newly implemented two-column layout—featuring the dedicated Move Analysis Panel—provides a significantly upgraded and engaging chess playing experience. The project maintains a clean structure using pure HTML, CSS, and JavaScript, ensuring ease of deployment and maintenance.

