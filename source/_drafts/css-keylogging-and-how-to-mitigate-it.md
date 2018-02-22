---
title: CSS Keylogging and how to Mitigate it
excerpt: Clever usage of CSS allows attackers to exfiltrate keystrokes to an attacker-controller server. This article examines how the attack works and how to migitate against it.

keywords:
  - Security
  - Web
  - Keylogging
  - Data Exfiltration
tags:
  - Security
  - Web
  - CSS
---

I recently stumbled upon a fairly creative [proof of concept][1] for (ab)using
Cascading Style Sheets to record a user's keystrokes off a website. The sample
code contains a server and a sample Chrome extension that forwards the content of `password`
type input fields in a webpage. The sample itself is missing a few things to be
usable by a bad guy, but all the ideas and ingredients are there, ripe for the
picking.

This attack is especially dangerous because of the fact that it can run in any
browser extension that has access to the HTML of your pages. The problem is
amplified because most extensions that provide something useful will usually
require access to one or more websites. A very bad and yet popular example of
that are extensions that inject CSS for custom styling of webpages. These
extensions provide something very attractive to users, and it is very easy to
forget that whenever you install a *user*-style, you're running user-submitted
content in your browser.

Websites that let users customize their personal page with a CSS theme, like
Reddit (sub-reddit themes), can trick you into signing-in to reddit after a visit to
their page, thus sniffing your password as you type it.

I'll first explain the concepts behind the attack and then show a simplified
example of what the attack code might look like. Once that is out of the way,
I will talk about possible mitigations for the attack.


[1]: https://github.com/maxchehab/CSS-Keylogging


## How the Attack Works


The attack abuses a few CSS concepts which, by themselves, are completely
harmless, but combined in a creative fashion, pave the way towards keylogging:

*Attribute Selectors* make it possible to target a specific node in the DOM tree
based on an attribute and its value. This is useful for instance, when
attempting to apply a style rule to all input fields of a same type:
`input[type="radio"]`. There are multiple special comparator such as the `~=`
and `$=` [comparators][2]. The latter has the following interesting documentation:

> Represents an element with an attribute name of attr whose value is suffixed (followed) by value.


[2]: https://developer.mozilla.org/en-US/docs/Web/CSS/Attribute_selectors

*Selector Chaining* is the concept of chaining multiple selectors to create a
more specific style rule. A good chaining example is the rule that says

``` css
#main input[type="radio"].valid {
    /* ... */
}
```

which targets an input of type `radio` which has the class `valid` and is inside
a node with an id of `main`.

*`url()` Value Keywords* which make it possible to reference static resources.
In any property that accepts an image as a value, as is the case with the
properties `background` and `background-image`, for example.

----

If the attack is not becoming clear yet, consider the following CSS snippet:

``` css
input[type="password"][value$="a"] {
  background: url("somewhere.png");
}
```

This rule says the following:

> For all inputs of type `password` that have a value ending in `a`, set the
> background to the image `somewhere.png`...

All that one needs to do now is have one CSS rule per valid password character.
Fortunately, for most websites, this is limited to ASCII printable characters,
and as such all an attacker needs is 127 rules.


