---
setup: |
  import Layout from '../../layouts/BlogPost.astro'
  import Cool from '../../components/Author.astro'
title: Password
publishDate: 05 JUL 2022
name: Mark Spratt
value: 128
description: What is a Password vault?
---

<a href="https://xkcd.com/936/?fbclid=IwAR1dBAc767rK5ni47plmh50MfOJ0f0pnzvUsua_UiZ7mpmBHuwnF_dbzr_U">
  <div align="center">
    ![img](https://imgs.xkcd.com/comics/password_strength.png)
  </div>
</a>

## Early Morning...

My mom messaged me one morning asking, "What is a  Password vault?"

### **TLDR:**

>A Password vault is a collection of passwords that you can use to log into a website. <br/> But you came here for something a bit more... complicated.

### **Long version:**

To start off we first need to break down what a password is. According to Webster:

```markdown
Definition of password

1: something that enables one to pass or gain admission:
such as a spoken word or phrase required to pass by a guard 
```

Passwords are these things we’re all plagued with within this new age of tech. Having to remember every unique password can be a pain. Using one of them for all your accounts isn’t recommended.

We know currently, that they’re not supposed to be simple. Oh, and they should contain numbers, symbols, and letters, but why? Hold on, let's rewind a bit. Like everything, there’s a history to it, right? Well, passwords, don't have a definitive date. Some speculate it was MIT  when they created the first time-sharing system.

## Story time

Emerging onto the stage a wizard performing magic goes by the name of Robert Morris.  To set the stage there is a realm called Unix, an operating system that was first developed in the 1960s. Morris conjured a process called `Hashing`. Not the same thing used for getting stoned; although they may have been at the time. His son later created the [Morris Worm](https://wikipedia.org/wiki/Morris_worm) on November 2, 1988, which infected large groups of systems. Its intended use was to see the size of the internet by exploiting loopholes in the codebase of machines. Doesn't sound like a bad idea, but it didn’t work quite as expected... leading to the first felony conviction of its kind.

Skipping a few years we get to the serious concerns for Password... theft. Such as Email accounts, MSN messengers, Geocities, Myspace, Blogger, Xanga, AIM, Yahoo, Hotmail, AOL... Remembers these? Which all came with the advent of the interweb created by Al Gore... Whoa... _looks at script_, wait one sec checking sources. Never mind, he messed up in a CBS thing. Sources believe XEROX stumbled upon the concept of the internet without knowing what size it would become. We have the internet and passwords are being encrypted by hashes...

## Hashing

What even are hashes? Don't freak out...Breath. You're about to see a long string of letters and numbers. This is intentional!

>Word 1: <br/>
>hash("hello") = 2cf24dba5fb0a30e26e83b2ac5b9e29e1b161e5c1fa7425e73043362938b9824

>Word 2: <br/>
>hash("hbllo") = 58756879c05c68dfac9866712fad6a93f8146f337a69afe7dd238f3364946366

Oh, wait… if someone else uses the same password they have the encryption code too. Guess they’re screwed, lol. They were until companies started a process called SALT. By adding a header (like multiplying it  or double encrypting it) to the password it varies the hash like so:

>hash("hello") = 2cf24dba5fb0a30e26e83b2ac5b9e29e1b161e5c1fa7425e73043362938b9824

Remember this code? Well, let's sprinkle it with SALT. The SALT is a random string of letters and numbers.

>Hash example 1 ("hello" + "QxLUF1bgIAdeQX") = 9e209040c863f84a31e719795b2577523954739fe5ed3b58a75cff2127075ed1
<br/>
>Hash example 2 ("hello" + "bv5PehSMfV11Cd") = d1d3ec2e6f20fd420d50e2642992841d8338a314b8ea157c9e18477aaef226ab

This prevented hackers using banks of passwords, Lookup tables (Those perverts), and some flamboyant thing called Rainbow Tables… Google that too.

So, how do Password Managers work? Various vaults work in different ways, but the majority of them Encrypt the passwords and other important information such as Credit cards, addresses, etc. They will also generate strong passwords for you to use and then saves them for you so you don’t have to recall them. The next time you log in they regurgitate the information and it unlocks the account.

“But this still doesn’t tell me what app to use!?!” (I hear you mom)
There is a lot to choose from, but these are the ones used the most.

LastPass is a cloud-based password manager. Allowing you to access your passwords regardless of the device you’re on.
KeePass is a locally stored password manager. Means you need the device you're on in order to log into that account.
