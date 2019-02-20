# Propeller Aero solutions

## Assumptions 
1. The monolith part of the system is not to be touched since it is legacy code.
2. Can tweak and make changes in micorservice. (well, thats the point of micorservice)
3. Solve the problem of login throughout the domain (**.lcl.host is considered as the domain for the application)
4. Microservices talk to each other internally using service layers (either docker compose or kubernetes services)
5. All forms of authentication follow either cookies (for browsers) or headers (SSO/OAuth) based approach
6. Reverse proxy is the only way for external sources to interact with containers. (Containers are not exposed without nginx)
7. Optimise communications between containers and allow for async or cron jobs between containers
8. All requests are HTTP only. So I have have not used certificates anywhere

## Working Solution
1. Go to your preferred workspace 
2. RUN following commands 
    * git clone https://github.com/gauti038/properller-aero-challenge.git
    * cd properller-aero-challenge
    * docker-compose up --build
    * Clear your browser cookies --> Very important
3. Open http://random.lcl.host:5000/ on chrome and enter --> root / password123 
4. You can try other subdomains without having to login everytime
4. Copy the authtoken 
5. From another terminal run - 
    * curl -w '\n' http://localhost:5000/microservice 
    * You will see - "please pass either sessionid cookie or authtoken header"
    * Nginx is responding with this error without even calling microservice, saving load on microservice
6. From another terminal
    * curl -w '\n' http://localhost:5000/microservice -H 'authtoken:<paste the token from browser here>'
    * Hello World!. Your authtoken is <>
    * This response is from microservice after validating the token with monolith
    * This approach can be used by async or cronJobs to communicate with microservice from outside the environment

## Solution Flow

### login 
1. First time user opens http://domain.lcl.host:5000/ , gets to login page
2. After entering username and password --> nginx redirects --> monolith 
3. Monolith validates and responds with cookies
4. nginx returns this response and adds a domain name for cookie as .lcl.host
5. The Browser reuses the same cookie across the domain of .lcl.host 
5. Can try other subdomains - http://asdf.lcl.host:5000/ or http://propeller.lcl.host:5000/ 

### microservie 
1. There are 2 ways to access microservice - 1. Browser , 2. REST API 
2. For Browser - 
    * browser must have a cookie by name session id, else nginx rejects it (401 unauthorized)
    * nginx converts value of this cookie as authtoken header value (for generalising microservice code)
    * forwards it to microservice service
3. For REST APIs - 
    * The sender must send an authtoken as header, else nginx rejects and retuns 401 (unauthorized)
    * nginx forwards it to microservice
    * this approach can also be used by async or cron jobs by making REST calls
4. At microservice -
    * It always reads the authtoken header. if no header --> throw 401 (unauthorized)
    * If token exists validate with monolith service 
    * This check filters many requets thereby reducing load on monolith 

### Internal Communications 
1. Always uses service names instead of nginx / host urls 
2. No need to pass any authtoken or cookie 
3. Since these communications are always internal and thereby DONOT need authentication
4. Also because these service are not exposed outside - no external source can directly call these services without nginx
5. RUN this command on the host
    * docker exec -it $(docker ps | grep monolith| awk '{print $1}') sh -c "curl -v -w '\n' http://microservice:3000/"
    * As you can see, these internal communications dont need auth validation --> reduced load on monolith

