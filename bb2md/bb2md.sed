#!/bin/sed -rf

s/\[\/\*\]//
s/\[(\/)?(color|list)(=[^]]+)?]//g
/^$/d
s/^.+$/&\n/
s/^\[size=4\]/# /
s/\[size=[^]]+\]//g
s/\[\/size\]//g
s/\[url\]([^[]+)/[\1](\1)/g
s/\[url=([^]]+)\]([^[]+)/[\2](\1)/g
s/\[\/url\]//g
s/\[(\/)?(i|b|u|s)\]/<\1\2>/g
s/^\[\*\]/* /
s/\[\*\]/\n* /

/\[spoiler/,/\[\/spoiler\]/ {
	s/\[spoiler\]//
	s/\[spoiler=([^]]+)\]/\1\n>/
	s/^/>/g
	s/\n/\n>/g
	s/\[\/spoiler\]//
}

/\[quote/,/\[\/quote\]/ {
	s/\[quote\]//
	s/\[quote=([^]]+)\]/\1\n>/
	s/^/>/g
	s/\n/\n>/g
	s/\[\/quote\]//
}
