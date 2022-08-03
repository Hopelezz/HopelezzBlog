---
layout: ../../layouts/BlogPost.astro
setup: |
  import Author from '../../components/Author.astro'
title: Password
publishDate: 05 JUL 2022
name: Mark Spratt
href: https://twitter.com/_Hopelezz
description: What is a Password vault?
tags: passwords, vault, hash, recall
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

Passwords are these things we’re all plagued with within this new age of tech. Having to remember every unique password can be a pain. Yet, using one of them for all your accounts isn’t recommended. What's the fix?

We know currently, that passwords aren't supposed to be simple. Oh, and they should contain numbers, symbols, and letters. `but why?` I hear you say. Hold on, let's rewind a bit. Like everything, there’s a history to it, right? Well, passwords, don't have a definitive date. Some speculate it was MIT  when they created the first time-sharing system.

## Story time

Emerging onto the stage a wizard performing magic goes by the name of Robert Morris. To set the stage there is a realm called Unix, an operating system that was first developed in the 1960s. Morris conjured a process known as `Hashing`. Not the same thing used for getting stoned; although they may have been at the time. His son later created the [Morris Worm](https://wikipedia.org/wiki/Morris_worm) on November 2, 1988, with the hashing concept. This infected large groups of systems. Its intended use was to see the size of the internet by exploiting loopholes in the codebase of machines. Doesn't sound like a bad idea, but it didn’t work quite as expected... leading to the first felony conviction of its kind.

Skipping a few years we get to the serious concerns for Password... theft. Such as Email accounts, MSN messengers, Geocities, Myspace, Blogger, Xanga, AIM, Yahoo, Hotmail, AOL... Remembers these? These all came with the advent of the internet created by Al Gore... Whoa... _looks at script_, wait one sec checking sources. Never mind, he horribly misquoted. Sources believe XEROX stumbled upon the concept of the internet without knowing what size it would become. So we have the internet and passwords are being encrypted by hashes...

## Hashing

What even are hashes? Don't freak out...Breath. You're about to see a long string of letters and numbers. This is intentional! You don't have to memorize this or even read it. Just know it's a random string of characters.

>Word 1: <br/>
>hash("hello") = 2cf24dba5fb0a30e26e83b2ac5b9e29e1b161e5c1fa7425e73043362938b9824

>Word 2: <br/>
>hash("hbllo") = 58756879c05c68dfac9866712fad6a93f8146f337a69afe7dd238f3364946366

You probably went "wait… if someone else uses the same password then they have the encryption code too." CORRECT! They were until companies banded together and started a process called `SALT`. By adding a header (like multiplying it or double encrypting it) to the password it varies the hash like so:

>Remember this?
>hash("hello") = 2cf24dba5fb0a30e26e83b2ac5b9e29e1b161e5c1fa7425e73043362938b9824

Let's sprinkle it with SALT. The SALT is a random string of letters and numbers added to the word

>Hash example 1:
>hash("hello" + "QxLUF1bgIAdeQX") = 9e209040c863f84a31e719795b2577523954739fe5ed3b58a75cff2127075ed1
<br/>
>Hash example 2:
>("hello" + "bv5PehSMfV11Cd") = d1d3ec2e6f20fd420d50e2642992841d8338a314b8ea157c9e18477aaef226ab

This prevented hackers from using banks of passwords like [dictionary attacks](https://en.wikipedia.org/wiki/Dictionary_attack), which use lookup tables... _Those perverts_!

There have since been many other alternatives to the hashing system. For example: Password-Based Key Derivation Function 1 and 2 or [PBKDF2](https://en.wikipedia.org/wiki/PBKDF2) for short.

>Wiki: PBKDF2 applies a pseudorandom function, such as hash-based message authentication code (HMAC), to the input password or passphrase along with a salt value and repeats the process many times to produce a derived key, which can then be used as a cryptographic key in subsequent operations.

In short, the SALT is repeated many times to create a key.

## The Fix

We have a lot of passwords, but we don't want to recall all them. On top of that each should be unique. In comes the advent of Password Managers a.k.a. vaults.

The majority of vaults encrypt passwords along with other information such as Credit Cards, addresses, and so on. Some even generate strong passwords for you to use and recalls them so you don’t have to remember what they were. Assuming you are on the same device or have linked your device to the vault.

“But this still doesn’t tell me what app to use!?!” _I hear you mom_

There is a lot to choose from, but these are the ones used the most.

Truth is if you've been using Google Chrome for any period of time you're most likely already using one. Google Password Manager is a website password manage. This feature is baked into the Google Chrome web browser. Includes generated unique, secure passwords for each website you visit as well as. check if any of the passwords you’re using online have been compromised in a data security breach. 

LastPass is a cloud-based manager. Allowing you to access your passwords regardless of the device you’re on.

KeePass is a locally stored manager. Meaning you need the device you're on to log into the account.

Some apps has the ability refence Google, Facebook, Twitter, etc accounts. To help reduce the total number passwords. 

## Suggestion

Recall the comic strip in the beginning? 

This one:
<a href="https://xkcd.com/936/?fbclid=IwAR1dBAc767rK5ni47plmh50MfOJ0f0pnzvUsua_UiZ7mpmBHuwnF_dbzr_U">
  <div align="center">
    ![img](https://imgs.xkcd.com/comics/password_strength.png)
  </div>
</a>

It memes on the idea that `Tr0ub4dor&3` is far harder to recall than `correcthorsebatterystaple`. This is true!

 `1MillionBabyParrots!` is still a viable password, readable, and provides a higher level of security than something like `Tr0ub4dor&3`.
