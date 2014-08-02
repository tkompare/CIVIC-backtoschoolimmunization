back2schoolshots
================

In 2013, while on the path of redesigning last year's Flu Shot Finder for this
upcoming season, I stumbled into a conversation about the Chicago
Department of Public Health's (CDPH) "Back To School" immunization
campaign. These events are free for anyone 6 months to 18 years old.
Parents are asked to bring their children's shot records with them.

I volunteered to build a web application for CDPH to help parents find
immunization events across the city.

http://backtoschoolimmunization.org/

WIN: CDPH agreed to update the data behind the web application as
needed. There are frequent and timely updates as events are confirmed
or cancelled. We made this process as easy as possible.

WIN: CDPH and I used this Back To School web app as a technical
and logistical test run for the Flu Shot Finder. Not only
is much of the code essentially the same, but also the data
format will match. Data is formatted according to a national effort to
standardize these data, lead by Mark Headd, the former CTO for the City of
Philadelphia. This also gave CDPH a feel for what it took to
keep the Flu Shot Finder application information up to date.

The draft standards document is here:
https://docs.google.com/a/kompare.us/document/d/1ikTyX1xWpw86u-xuokEJAGwe-tyKAeYl3qFLw0poAAE

The data behind the Back To School web app is here:
https://docs.google.com/a/kompare.us/spreadsheet/ccc?key=0Ak5nccUbvw6YdEhXbjVrZWVVVFBqcTJqX19jUnc2YVE&usp=sharing

The (MIT Licensed) code behind the Back To School web app is here:
https://github.com/tkompare/CIVIC-back2schoolimmunization

Special thanks to Raed Mansour who made this happen on CDPH's side.
Shout out goes to Dr. Julie Morita, CDPH doctor in charge of
immunization programs and is incredibly helpful and responsive. And
also for Dr. Bechara Choucair, Commissioner of CDPH. He creates an
environment where partnership with open where initiatives like this
are encouraged.

Implementation Hints:
You probably want someone who knows Javascript fairly well. It's not
impossible code, but its easier with someone who is confident in JS.
Most of the default set-up is in '/js/main.js' at the top in a JS "object"
called 'Default'. Also, you should totally swap out all of the graphics.
I don't think the City of Chicago would like you using it without
permission. I mean seriously, do you want to get on Rahm's bad side and
have him send you a dead fish among other things? I know the City's
Corporation Counsel personally. Believe me, you don't want to get on his
bad side either.
