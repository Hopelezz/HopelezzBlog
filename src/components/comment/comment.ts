import  * as firebase from 'firebase/app';
import 'firebase/firestore';

interface CommentsConfig {
    authDomain: string;
    projectId: string;
}
class Comments {
    blogTitle: HTMLHeadingElement;

    constructor() {
        this.blogTitle = document.querySelector('.blog-title') as HTMLHeadingElement;

        //run animations
        this.animateHeader();
    }

    animateHeader() {
        this.blogTitle.classList.add('animated', 'fadeInDown');
    }
}

new Comments();