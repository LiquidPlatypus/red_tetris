# red_tetris

Premier projet post tronc commun réalisé, permettant de jouer à Tetris en multijoueur en ligne.

# install if new repo :
npm init -y
npm install express socket.io

Fonction Pure :

Les fonctions pure dans la logique de jeu est uniquement pour les fonctions qui gere les mouvements, ou la generation de pieces.

Exemple dans notre code :

GetNextTetromino() n'est PAS pure, mais elle utilise refillBag pour recharger la list de piece qui elle est pure. GetNextTetromino est un getter.

Une fonction pur ne doit modifier aucune variables defenies en dehors d'elle meme.
Donc refillBag() dans notre exemple est pure car elle calcule la prochaine list de piece et la return, dans GetNextTetromino() on recupere ses valeurs et on les appliques.
