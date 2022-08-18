import { initializeApp } from "firebase/app";
import { getFirestore } from 'firebase/firestore';
import * as firebase from 'firebase/app';
import 'firebase/firestore';

interface CommentsConfig {
    authDomain: string;
    projectId: string;
}
class Comments {

    blogTitle: HTMLHeadingElement;
    firebaseApp: firebase.app.App;
    commentsRef: firebase.firestore.CollectionReference;
    loadComments: HTMLButtonElement

    constructor(config: CommentsConfig) {
        this.blogTitle = document.querySelector('#blogTitle') as HTMLHeadingElement;
        this.loadComments = document.querySelector('#loadComments') as HTMLButtonElement;
        //run animations
        this.animateHeader();

        this.firebaseApp = firebase.initializeApp(config);
        this.commentsRef = this.firebaseApp
        .firestore()
        .collection('articles')
        .doc('article_one')
        .collection('comments');

        this.addListeners();
    }

    addListeners() {
        this.loadComments.addEventListener('click', event => {
            this.loadComments.classList.add('hidden');
        });
    }

    animateHeader() {
        this.blogTitle.classList.add('animated', 'fadeInDown');
    }
}

new Comments({
    authDomain: 'blackskies-3522c.firebaseapp.com',
    projectId: 'blackskies-3522c'
});

const firebaseConfig = {
    apiKey: "AIzaSyDrtOpubezws9rxaZbIMYvBFm0myMeOsaE",
    authDomain: "blackskies-3522c.firebaseapp.com",
    projectId: "blackskies-3522c",
    storageBucket: "blackskies-3522c.appspot.com",
    messagingSenderId: "893625964436",
    appId: "1:893625964436:web:ab6e04fa689413ee2d6181",
    measurementId: "G-DPCQEVVBMF"
  };

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);