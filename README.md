The application that we built is essentially a 2-player Family Feud game. First the user will log in with the following screen, inputting his/her initials:

 

He will then be redirected to waiting room until another person logs in the game, as seen below:

 

When another person logs in, the game will commence. The player will guess the answer to the question presented, of which he has three chances. He may also pass if he chooses to do so. 

 

The question that is asked is actually pulled up from the database that we have. The question, all its answers and their respective value points are all stored in the database. If the player gets it incorrect three times or passes, it will be the opponent’s turn to guess.

 

The game either ends if both players manage to reveal all 6 answers to the question or if they both pass/strike out three times. 

 

In the mobile version, the user is given a textbox and a submit button. He may input a JSON object in this textbox and click the submit button, which will then actually insert his question into the database. This question may then be asked in future iterations of the game.
