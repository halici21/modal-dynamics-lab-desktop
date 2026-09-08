"""Development-only independent SciPy oracles. No application/runtime Python dependency."""
import json, pathlib, numpy as np, scipy, scipy.linalg as la
from scipy.integrate import solve_ivp, quad
ROOT = pathlib.Path(__file__).resolve().parents[1]
rng = np.random.default_rng(20419)
cases = []
for n in [2, 3, 4, 5, 10, 16]:
    B = rng.normal(size=(n,n)); M = B.T@B + np.eye(n)
    D = rng.normal(size=(n,n)); K = 100*(D.T@D + .3*np.eye(n))
    C = .2*M + .003*K
    vals, phi = la.eigh(K,M)
    frfs=[]
    for w in [0, 2.3, 10, 37, 1000]:
        H=la.solve(K-w*w*M+1j*w*C,np.eye(n))
        frfs.append(dict(omega=w, real=H.real.tolist(), imag=H.imag.tolist()))
    cases.append(dict(M=M.tolist(),K=K.tolist(),C=C.tolist(),values=vals.tolist(),phi=phi.tolist(),frfs=frfs))
# Independent beam matrices: integrate Hermite shape functions and second derivatives.
E,rho,A,I,L = 2e7,1000,.01,1e-5,.7
def N(s): return np.array([1-3*s*s+2*s**3,L*(s-2*s*s+s**3),3*s*s-2*s**3,L*(-s*s+s**3)])
def B(s): return np.array([-6+12*s,L*(-4+6*s),6-12*s,L*(-2+6*s)])/L**2
beamM=np.array([[quad(lambda s: rho*A*L*N(s)[i]*N(s)[j],0,1,epsabs=1e-12)[0] for j in range(4)]for i in range(4)])
beamK=np.array([[quad(lambda s: E*I*L*B(s)[i]*B(s)[j],0,1,epsabs=1e-9)[0] for j in range(4)]for i in range(4)])
fe=[]
for kind,per in [('bar',1),('beam',2),('frame',3)]:
  for count in [1,2,4,8,16]:
    n=per*(count+1); K=np.zeros((n,n)); M=np.zeros_like(K); l=1/count
    Na=lambda s:np.array([1-s,s]); Ba=np.array([-1,1])/l
    ka=E*A*l*np.outer(Ba,Ba); ma=np.array([[quad(lambda s:rho*A*l*Na(s)[i]*Na(s)[j],0,1)[0]for j in range(2)]for i in range(2)])
    def Nh(s):return np.array([1-3*s*s+2*s**3,l*(s-2*s*s+s**3),3*s*s-2*s**3,l*(-s*s+s**3)])
    def Bh(s):return np.array([-6+12*s,l*(-4+6*s),6-12*s,l*(-2+6*s)])/l**2
    kb=np.array([[quad(lambda s:E*I*l*Bh(s)[i]*Bh(s)[j],0,1)[0]for j in range(4)]for i in range(4)])
    mb=np.array([[quad(lambda s:rho*A*l*Nh(s)[i]*Nh(s)[j],0,1)[0]for j in range(4)]for i in range(4)])
    if kind=='bar':ke,me=ka,ma
    elif kind=='beam':ke,me=kb,mb
    else:
      ke=np.zeros((6,6));me=np.zeros((6,6))
      for ids,kq,mq in [([0,3],ka,ma),([1,2,4,5],kb,mb)]:
        ke[np.ix_(ids,ids)]=kq;me[np.ix_(ids,ids)]=mq
    for e in range(count):
      ids=np.arange(per*e,per*(e+2));K[np.ix_(ids,ids)]+=ke;M[np.ix_(ids,ids)]+=me
    vals=la.eigh(K[per:,per:],M[per:,per:],eigvals_only=True)
    fe.append(dict(kind=kind,elements=count,omega=np.sqrt(vals).tolist()))
dt=.02; times=np.arange(151)*dt
acc=np.sin(2*np.pi*1.7*times)*np.sin(np.pi*times/times[-1])**2
spectra=[]
for T in [.2,.5,1,2]:
  w=2*np.pi/T
  def fun(t,y):return [y[1],-2*.05*w*y[1]-w*w*y[0]-np.interp(t,times,acc)]
  # DOP853 independent of Newmark, resolved to 1/1000 record dt.
  sol=solve_ivp(fun,[0,times[-1]],[0,0],method='DOP853',rtol=1e-11,atol=1e-13,max_step=dt/8,dense_output=True)
  peak=np.max(np.abs(sol.sol(np.linspace(0,times[-1],150001))[0]))
  spectra.append(dict(period=T,Sd=float(peak),pseudoSv=float(w*peak),pseudoSa=float(w*w*peak)))
psdVariance=quad(lambda f:.2/((100-(2*np.pi*f)**2)**2+(4*2*np.pi*f)**2),0,20,epsabs=1e-13,points=[10/(2*np.pi)])[0]
out=dict(provenance=dict(numpy=np.__version__,scipy=scipy.__version__,seed=20419,solver='scipy.linalg.eigh (LAPACK); solve; DOP853; quadrature'),cases=cases,beam=dict(E=E,rho=rho,A=A,I=I,L=L,M=beamM.tolist(),K=beamK.tolist()),fe=fe,spectrum=dict(dt=dt,acceleration=acc.tolist(),results=spectra),psd=dict(inputPerHz=.2,maxHz=20,variance=psdVariance))
dest=ROOT/'tests/fixtures/full-physics-oracle.json';dest.parent.mkdir(exist_ok=True)
dest.write_text(json.dumps(out,indent=2))
print(str(dest));print('Independent cases:',len(cases),'FE cases:',len(fe))
