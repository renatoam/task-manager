# How to run

## To run locally with hot reload, run:

```zsh
docker compose up rabbit relay consumer [-d]
```

Then:

```zsh
npm run dev
```

## To run locally to use the containers, run:

```zsh
docker compose up [-d] [--build]
```

## To use local Kubernetes cluster, run:

```zsh
minikube start --driver qemu --network socket_vmnet
```

Then use the internal minikube's docker:

```zsh
eval $(minikube docker-env) && docker images
```

And build the images inside the cluster:

```
docker build -t [image] [path of dockerfile]
```

Now, create a deployment for each image:

```
kubectl [or `minikube kubectl --` if alias is not set] create deployment --image=[image]
```

Then, expose the deployment (create a service) for each image:

```
kubectl expose deployment [image] --type=NodePort --port=[port set in the image]
```

In another terminal, run:

```
minikube service app [which is likely the main dply/svc] --url
# use the given url to access the app in the browser
```
