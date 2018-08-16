#!/bin/sh

for f in ../src/bb/*.txt; do
	./bb2md.sed "$f" > ../src/md/`basename "$f" .txt`.md
done
