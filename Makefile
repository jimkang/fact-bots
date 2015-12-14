HOMEDIR = $(shell pwd)

stop-docker-machine:
	docker-machine stop dev

start-docker-machine:
	docker-machine start dev

create-docker-machine:
	docker-machine create --driver virtualbox dev

# connect-to-docker-machine:
	# eval "$(docker-machine env dev)"

build-docker-image:
	docker build -t jkang/fact-bots .

push-docker-image: build-docker-image
	docker push jkang/fact-bots

run-docker-image:
	docker run -v $(HOMEDIR)/config:/usr/src/app/config \
		jkang/fact-bots make run

pushall: push-docker-image
	git push origin master

run:
	node post-tweet.js
