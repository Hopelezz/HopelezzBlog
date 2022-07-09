---
setup: |
  import Layout from '../../layouts/BlogPost.astro'
  import Cool from '../../components/Author.astro'
title: Password 2
publishDate: 06 JUL 2022
name: Mark Spratt
value: 128
description: What is a Password vault?
---
<div align="center">
# Early Morning

</div>
<a href="https://xkcd.com/936/?fbclid=IwAR1dBAc767rK5ni47plmh50MfOJ0f0pnzvUsua_UiZ7mpmBHuwnF_dbzr_U">
  <div align="center">
    ![img](https://imgs.xkcd.com/comics/password_strength.png)
  </div>
</a>

My mom messaged me one morning asking, "What is a  Password vault?".

To start off we first need to break down what a password is. According to Webster:

```
Definition of password

1: something that enables one to pass or gain admission:
such as a spoken word or phrase required to pass by a guard 
```

Passwords are these things we’re all plagued with within this new age of tech. Having to remember every unique password can be a pain. Using one of them for all your accounts isn’t recommended.  

 We know currently, they’re not supposed to be simple. Oh, and they should contain numbers, symbols, and letters, but why? Hold on, let's rewind a bit. Like everything, there’s a history to it, right? Well, passwords, don't have a definitive date. Some speculate it was MIT  when they created the first time-sharing system.

Emerging onto the stage a wizard performs magic. Goes by the name Robert Morris. They conjured in a realm known as UNIX a process called `Hashing`. Not the same thing used for getting stoned; although they may have been at the time. His son later created the Morris worm which infected large groups of systems. Its intended use was to see the size of the internet by exploiting loopholes in the code on machines. That doesn't sound like a bad idea, but it didn’t work quite as expected... [Article](https://wikipedia.org/wiki/Morris_worm)

Skipping a few years we get to the serious concerns for Password... theft. Such as, Email accounts, messengers, Geocities, myspace, Blogger, Xanga, AIM, Yahoo, Hotmail, AOL (Who remembers these? lol) which all came with the advent of the interweb created by Al Gore…. Whoa, whoa, wait... Who? Nah he messed up in a CBS thing. Actually, this is yet another debate, but they believe Xerox stumbled upon it, without knowing to what magnitude it would eventually have. 

Anyways, so now we have the internet and passwords being encrypted into hashes… ugh wait What are hashes? They’re these strings of letters and numbers in seemingly random order.
hash("hello") = 2cf24dba5fb0a30e26e83b2ac5b9e29e1b161e5c1fa7425e73043362938b9824
hash("hbllo") = 58756879c05c68dfac9866712fad6a93f8146f337a69afe7dd238f3364946366

Oh, wait… if someone else uses the same password they have the encryption code too. Guess they’re screwed, lol. They were until companies started a process called SALT. By adding a header (like multiplying it  or double encrypting it) to the password it varies the hash like so:

hash("hello") = 2cf24dba5fb0a30e26e83b2ac5b9e29e1b161e5c1fa7425e73043362938b9824
Remember this code? Well, let's sprinkle it with salt 

Hash example 1 ("hello" + "QxLUF1bgIAdeQX") = 9e209040c863f84a31e719795b2577523954739fe5ed3b58a75cff2127075ed1

Hash example 2 ("hello" + "bv5PehSMfV11Cd") = d1d3ec2e6f20fd420d50e2642992841d8338a314b8ea157c9e18477aaef226ab

This prevented hackers using banks of passwords, Lookup tables (Those perverts), and some flamboyant thing called Rainbow Tables… Google that too. 

So, how do Password Managers work? Various vaults work in different ways, but the majority of them Encrypt the passwords and other important information such as Credit cards, addresses, etc. They will also generate strong passwords for you to use and then saves them for you so you don’t have to recall them. Next time you log in they regurgitate the information and it unlocks the account. 

“But this still doesn’t tell me what app to use!?!” (I hear you mom) 
There are a lot to chose from, but these are the ones used the most. 

LastPass is a cloud-based password manager. Allowing you to access your passwords regardless of the device you’re on. 
KeePass is a locally stored password manager. Meaning you need the device you're on in order to log into that account.