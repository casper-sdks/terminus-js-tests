#!/usr/bin/env bash
docker run --rm -it --name storm-nctl -d -p 11101:11101 -p 14101:14101 -p 18101:18101 casper-nctl:v1413